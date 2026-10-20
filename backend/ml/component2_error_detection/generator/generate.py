"""
Generate + execution-verify a synthetic Java error dataset for Component 2.

Usage: python3 generate.py OUT_DIR [--instances 60] [--seed 42]
"""
import argparse, csv, json, os, random, re, shutil, subprocess, sys, hashlib
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from families import FAMILIES, REASON_GROUP, broad_of

SEP = "//@@MAIN@@"
LIT = re.compile(r'"(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'')
OPS = re.compile(r"\s*(<=|>=|==|!=|\+=|-=|\*=|/=|\+\+|--|&&|\|\||[=+\-*/%<>])\s*")


def outside_literals(text, fn):
    out, last = [], 0
    for m in LIT.finditer(text):
        out.append(fn(text[last:m.start()])); out.append(m.group(0)); last = m.end()
    out.append(fn(text[last:]))
    return "".join(out)


def make_style(r):
    return dict(indent=r.choice(["    ", "    ", "  ", "\t", ""]),
                brace_newline=r.random() < 0.2,
                compact=r.random() < 0.3,
                comma_tight=r.random() < 0.25,
                one_line=r.random() < 0.15)


def apply_style(lines, st, allow_one_line=True):
    res = []
    for ln in lines:
        stripped = ln.lstrip(" ")
        depth = (len(ln) - len(stripped)) // 4
        body = stripped
        if st["compact"]:
            body = outside_literals(body, lambda s: OPS.sub(r"\1", s))
        if st["comma_tight"]:
            body = outside_literals(body, lambda s: s.replace(", ", ","))
        if st["brace_newline"] and body.endswith(" {") and len(body) > 2:
            res.append(st["indent"] * depth + body[:-2]); res.append(st["indent"] * depth + "{")
        else:
            res.append(st["indent"] * depth + body)
    if st["one_line"] and allow_one_line:
        return " ".join(x.strip() for x in res)
    return "\n".join(res)


def wrap_full(methods_lines, body_lines, cls="Main"):
    out = [f"public class {cls} {{"]
    for ln in methods_lines:
        out.append("    " + ln)
    if methods_lines:
        out.append("")
    out.append("    public static void main(String[] args) {")
    for ln in body_lines:
        out.append("        " + ln)
    out.append("    }")
    out.append("}")
    return out


def build_instance(fname, r):
    concept, lines, methods, muts = FAMILIES[fname](r)
    decl_out = {t for tag, t in lines if tag in ("decl", "out")}
    src = "\n".join(methods) + "\n" + SEP + "\n" + "\n".join(t for _, t in lines)
    variants = [("CORRECT_NO_ERROR", src, False)]
    for fine, old, new, ce in muts:
        if src.count(old) != 1:
            continue
        variants.append((fine, src.replace(old, new), ce))
    return concept, decl_out, variants


def split_src(src):
    m, b = src.split(SEP)
    m_lines = [x for x in m.strip("\n").split("\n") if x != ""]
    b_lines = [x for x in b.strip("\n").split("\n") if x != ""]
    return m_lines, b_lines


def generate(n_inst, seed):
    r = random.Random(seed)
    rows, seen = [], set()
    for fname in FAMILIES:
        for k in range(n_inst):
            inst_id = f"{fname}#{k:03d}"
            concept, decl_out, variants = build_instance(fname, r)
            for v_idx, (fine, src, ce) in enumerate(variants):
                m_lines, b_lines = split_src(src)
                st = make_style(r)
                w = [0.1, 0.25, 0.65] if fname.startswith("B_") else [0.3, 0.35, 0.35]
                form = r.choices(["full", "body", "minimal"], weights=w)[0]
                if form == "full":
                    shown_lines = wrap_full(m_lines, b_lines)
                    text = apply_style(shown_lines, st, allow_one_line=False)
                elif form == "body":
                    text = apply_style(m_lines + b_lines, st)
                else:
                    core = [x for x in b_lines if x not in decl_out] or b_lines
                    text = apply_style(m_lines + core, st)
                exec_src = "\n".join(wrap_full(
                    [apply_style([x], dict(st, one_line=False, brace_newline=False)) for x in m_lines],
                    [apply_style([x], dict(st, one_line=False, brace_newline=False)) for x in b_lines],
                    cls="__CLS__"))
                key = (text, fine == "CORRECT_NO_ERROR")
                if text in seen:
                    continue
                seen.add(text)
                group = REASON_GROUP[fine]
                rows.append(dict(instance_id=inst_id, family=fname, concept=concept, form=form,
                                 source_type="fill_in_blank" if fname.startswith("B_") else "logic",
                                 fine_reason=fine, reason_group=group, label=broad_of(group),
                                 expect_compile_error=ce, code=text, exec_src=exec_src, variant=v_idx))
    return rows


# ------------------------------------------------------------- verification
ENV = {k: v for k, v in os.environ.items() if k not in ("JAVA_TOOL_OPTIONS", "JDK_JAVA_OPTIONS", "_JAVA_OPTIONS")}
ERR_LINE = re.compile(r"^(?:.*[\\/])?(S\d+)\.java:(\d+): error: (.*)$", re.M)


def javac(files, out_dir):
    p = subprocess.run(["javac", "-nowarn", "-Xmaxerrs", "100000", "-encoding", "UTF-8", "-d", out_dir] + files,
                       capture_output=True, text=True, env=ENV)
    errs = defaultdict(list)
    for m in ERR_LINE.finditer(p.stderr):
        errs[m.group(1)].append(f"line {m.group(2)}: {m.group(3)}")
    return p.returncode, errs


def run_class(cls, cp):
    cmd = (f"set -o pipefail; timeout 2 java -Xmx64m -XX:+UseSerialGC -XX:TieredStopAtLevel=1 "
           f"-Xshare:auto -cp {cp} {cls} | head -c 3000")
    p = subprocess.run(["bash", "-c", cmd], capture_output=True, text=True, env=ENV)
    out, err = p.stdout, p.stderr
    m = re.search(r"Exception in thread \"main\" ([\w.$]+)(?::\s*(.*))?", err)
    if m:
        return "EXCEPTION", m.group(1).split(".")[-1], out
    if len(out) >= 3000:
        return "NON_TERMINATING_OUTPUT", "", out[:300]
    if p.returncode in (124, 137):
        return "TIMEOUT", "", out[:300]
    if p.returncode != 0:
        return "ERROR", err.strip()[:200], out
    return "OK", "", out


def verify(rows, work):
    if os.path.exists(work):
        shutil.rmtree(work)
    src_dir, out_dir = os.path.join(work, "src"), os.path.join(work, "out")
    os.makedirs(src_dir); os.makedirs(out_dir)
    files = {}
    for idx, row in enumerate(rows):
        cls = f"S{idx:06d}"
        row["_cls"] = cls
        path = os.path.join(src_dir, cls + ".java")
        with open(path, "w") as f:
            f.write(row["exec_src"].replace("__CLS__", cls))
        files[cls] = path
    # batch compile
    clss = list(files)
    compile_err = {}
    B = 400
    for s in range(0, len(clss), B):
        batch = clss[s:s + B]
        # javac stops after the parse phase if any file has syntax errors, so iterate:
        # drop files with reported errors and recompile the rest until the batch is clean.
        pending = list(batch)
        for _ in range(10):
            if not pending:
                break
            rc, errs = javac([files[c] for c in pending], out_dir)
            compile_err.update(errs)
            if rc == 0:
                break
            if not errs:  # failure we couldn't attribute: fall back to one-by-one
                for c in pending:
                    rc1, e1 = javac([files[c]], out_dir)
                    if rc1 != 0:
                        compile_err[c] = e1.get(c, ["unknown compile error"])
                break
            pending = [c for c in pending if c not in errs]
        for c in batch:  # anything without a .class file did not compile
            if c not in compile_err and not os.path.exists(os.path.join(out_dir, c + ".class")):
                rc1, e1 = javac([files[c]], out_dir)  # compile on its own to get a definite answer
                if rc1 != 0:
                    compile_err[c] = e1.get(c, ["unknown compile error"])
        print(f"  compiled {min(s + B, len(clss))}/{len(clss)}", flush=True)
    for row in rows:
        e = compile_err.get(row["_cls"])
        row["compiles"] = e is None
        row["compile_error"] = e[0] if e else ""
    to_run = [row for row in rows if row["compiles"]]
    done = [0]

    def job(row):
        row["run_status"], row["exception"], row["stdout"] = run_class(row["_cls"], out_dir)
        done[0] += 1
        if done[0] % 500 == 0:
            print(f"  ran {done[0]}/{len(to_run)}", flush=True)
    with ThreadPoolExecutor(max_workers=4) as ex:
        list(ex.map(job, to_run))
    for row in rows:
        if not row["compiles"]:
            row["run_status"], row["exception"], row["stdout"] = "COMPILE_ERROR", "", ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--instances", type=int, default=60)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--cap", type=int, default=320)
    ap.add_argument("--cap_correct", type=int, default=480)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    rnd = random.Random(a.seed)

    rows = generate(a.instances, a.seed)
    print("generated (deduped):", len(rows))
    print(Counter(r["reason_group"] for r in rows))

    # pre-sample with margin so verification stays fast; always keep the correct variant of used instances
    by_group = defaultdict(list)
    for row in rows:
        by_group[row["reason_group"]].append(row)
    chosen = []
    for g, lst in by_group.items():
        rnd.shuffle(lst)
        cap = a.cap_correct if g == "CORRECT_NO_ERROR" else a.cap
        chosen += lst[:int(cap * 1.35)]
    insts = {r["instance_id"] for r in chosen}
    refs = {r["instance_id"]: r for r in rows if r["fine_reason"] == "CORRECT_NO_ERROR" and r["instance_id"] in insts}
    for iid, r in refs.items():
        if r not in chosen:
            r["_ref_only"] = True
            chosen.append(r)
    print("verifying:", len(chosen))
    verify(chosen, os.path.join(a.out, "_work"))

    ref_out = {}
    for r in chosen:
        if r["fine_reason"] == "CORRECT_NO_ERROR" and r["run_status"] == "OK" and r["stdout"].strip():
            ref_out.setdefault(r["instance_id"], r["stdout"])

    kept, dropped = [], Counter()
    for r in chosen:
        ref = ref_out.get(r["instance_id"])
        if r["fine_reason"] == "CORRECT_NO_ERROR":
            ok = r["run_status"] == "OK" and r["stdout"].strip() != "" and r["stdout"] == ref
            reason = "correct_failed"
        elif r["expect_compile_error"]:
            ok = not r["compiles"]; reason = "expected_compile_error_but_compiled"
        else:
            ok = r["compiles"] and ref is not None and (r["run_status"] != "OK" or r["stdout"] != ref)
            reason = "equivalent_mutant_or_unexpected_compile_error"
        if ok and not r.get("_ref_only"):
            kept.append(r)
        elif not ok:
            dropped[(r["fine_reason"], reason)] += 1
    # final cap per group
    by_group = defaultdict(list)
    for r in kept:
        by_group[r["reason_group"]].append(r)
    final = []
    for g, lst in by_group.items():
        cap = a.cap_correct if g == "CORRECT_NO_ERROR" else a.cap
        final += lst[:cap]
    rnd.shuffle(final)

    def outcome(r):
        if not r["compiles"]:
            return "COMPILE_ERROR"
        if r["run_status"] == "EXCEPTION":
            return "RUNTIME_EXCEPTION"
        if r["run_status"] in ("TIMEOUT", "NON_TERMINATING_OUTPUT"):
            return "NON_TERMINATING"
        return "WRONG_OUTPUT" if r["fine_reason"] != "CORRECT_NO_ERROR" else "EXPECTED_OUTPUT"

    cols = ["sample_id", "instance_id", "family", "source_type", "concept", "form", "code", "label", "reason_group",
            "fine_reason", "verified_outcome", "compile_error", "runtime_exception", "expected_output", "actual_output"]
    with open(os.path.join(a.out, "c2_synthetic_dataset.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for i, r in enumerate(final):
            w.writerow(dict(sample_id=f"C2SYN_{i:05d}", instance_id=r["instance_id"], family=r["family"],
                            source_type=r["source_type"], concept=r["concept"], form=r["form"], code=r["code"], label=r["label"],
                            reason_group=r["reason_group"], fine_reason=r["fine_reason"],
                            verified_outcome=outcome(r), compile_error=r["compile_error"],
                            runtime_exception=r["exception"] if r["run_status"] == "EXCEPTION" else "",
                            expected_output=ref_out.get(r["instance_id"], "")[:300],
                            actual_output=(r["stdout"] or "")[:300]))
    stats = dict(final_rows=len(final),
                 reason_group=Counter(r["reason_group"] for r in final),
                 label=Counter(r["label"] for r in final),
                 form=Counter(r["form"] for r in final),
                 outcome=Counter(outcome(r) for r in final),
                 families=len({r["family"] for r in final}),
                 source_type=Counter(r["source_type"] for r in final),
                 dropped={f"{k[0]} | {k[1]}": v for k, v in dropped.most_common()})
    json.dump(stats, open(os.path.join(a.out, "dataset_stats.json"), "w"), indent=2)
    print(json.dumps(stats, indent=2))
    shutil.rmtree(os.path.join(a.out, "_work"))


if __name__ == "__main__":
    main()
