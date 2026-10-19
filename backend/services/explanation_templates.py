"""
Component 2: template explanations in Sinhala and Singlish
==========================================================
Used by ExplanationService.template_explanation when no LLM explanation is available
(LLM off, failed, timed out, or circuit breaker open), so the EN / සිංහල / Singlish
toggle always has text. One short set per reason group, plus the correct-answer and
text-question cases. Java keywords and code stay in English.

Each entry: summary / why / fix / tip. `summary` and `fix` are prefixed at runtime with
the student's option and the correct option.
"""

GROUP_TEXT = {
    "VARIABLE_ASSIGNMENT_ISSUE": {
        "si": {
            "summary": "variable එක declare කරන හෝ value එකක් assign කරන ආකාරයේ වැරැද්දක් තිබේ.",
            "why": "Java හි type එක, variable නම සහ = ලකුණ නිවැරදිව ලිවිය යුතුය. වැරදි type එකක්, වලංගු නොවන නමක් හෝ වැරදි operator එකක් නිසා compile error එකක් හෝ වැරදි value එකක් ලැබේ.",
            "fix": "type එක (int, boolean වැනි) සහ variable නම Java නීතිවලට අනුව ලියා, නිවැරදි value එක assign කරන්න.",
            "tip": "variable එකක් යනු ලේබලයක් ඇති පෙට්ටියකි: නිවැරදි ලේබලය දමා, නිවැරදි දේ ඇතුළට දමන්න.",
        },
        "singlish": {
            "summary": "Variable eka declare karana widihe hari value eka assign karana widihe waraddak thiyenawa.",
            "why": "Java wala type eka, variable name eka saha = lakuna hariyata liyanna one. Waradi type ekak, invalid name ekak hari waradi operator ekak nisa compile error ekak hari waradi value ekak enawa.",
            "fix": "Type eka (int, boolean wage) saha variable name eka Java rules walata anuwa liyala, hari value eka assign karanna.",
            "tip": "Variable ekak kiyanne label ekak thiyena box ekak wage: hari label eka dala, hari deyak athulata danna.",
        },
    },
    "VARIABLE_CALCULATION_ISSUE": {
        "si": {
            "summary": "ගණනය කිරීමේදී වැරදි operator එකක් හෝ වැරදි ප්‍රකාශනයක් භාවිතා කර ඇත.",
            "why": "code එක compile වුවත්, + - * / % අතරින් වැරදි එකක් යෙදුවොත් ප්‍රතිඵලය වැරදි වේ.",
            "fix": "ගැටලුව ඉල්ලන ගණනය කිරීමට ගැළපෙන operator එක යොදා, කුඩා අගයකින් අතින් පරීක්ෂා කරන්න.",
            "tip": "Java හි ගණිතය පාසලේ ගණිතය මෙන්මය: discount එකක් අඩු කිරීමට - ලකුණ යොදන්න.",
        },
        "singlish": {
            "summary": "Calculation ekedi waradi operator ekak hari waradi expression ekak use karala thiyenawa.",
            "why": "Code eka compile unath, + - * / % walin waradi ekak use karoth result eka waradi wenawa.",
            "fix": "Prashnaya illana calculation ekata galapena operator eka use karala, podi value ekakin athin check karanna.",
            "tip": "Java wala maths iskole maths wagemai: discount ekak adu karanna - lakuna danna.",
        },
    },
    "LOOP_BOUNDARY_ISSUE": {
        "si": {
            "summary": "loop එක එක් වරක් වැඩියෙන් හෝ අඩුවෙන් ක්‍රියාත්මක වේ.",
            "why": "< වෙනුවට <= යෙදීම හෝ වැරදි ආරම්භක අගයක් නිසා off-by-one error එකක් ඇති වේ.",
            "fix": "0 සිට n වතාවක් යාමට i < n භාවිතා කරන්න.",
            "tip": "loop එකේ පළමු සහ අවසාන i අගය අතින් ලියා බලන්න.",
        },
        "singlish": {
            "summary": "Loop eka eka warak wadiyen hari aduwen run wenawa.",
            "why": "< wenuwata <= use kirima hari waradi start value ekak nisa off-by-one error ekak enawa.",
            "fix": "0 indan n parak yanna i < n use karanna.",
            "tip": "Loop eke palaweni saha anthima i value eka athin liyala balanna.",
        },
    },
    "LOOP_CONDITION_ISSUE": {
        "si": {
            "summary": "loop එක පාලනය කරන condition එක වැරදියි.",
            "why": "condition එක loop එක වෙනස් කරන variable එකම පරීක්ෂා නොකළොත්, loop එක ක්‍රියා නොකරයි, නතර නොවේ, නැතහොත් compile නොවේ.",
            "fix": "loop එක වෙනස් කරන variable එකම (උදා: i) condition එකේ භාවිතා කරන්න.",
            "tip": "condition එක true නම් loop එක දිගටම යයි; false වූ විට නතර වේ.",
        },
        "singlish": {
            "summary": "Loop eka control karana condition eka waradi.",
            "why": "Condition eka loop eka wenas karana variable ekama check nokaroth, loop eka run wenne na, nawathinne na, nathnam compile wenne na.",
            "fix": "Loop eka wenas karana variable ekama (e.g. i) condition eke use karanna.",
            "tip": "Condition eka true nam loop eka digatama yanawa; false unama nawathinawa.",
        },
    },
    "LOOP_UPDATE_ISSUE": {
        "si": {
            "summary": "loop counter එක නිවැරදිව වෙනස් නොවේ, එබැවින් loop එක නොනැවතී යා හැක.",
            "why": "counter එක (i) වෙනස් නොවුණොත් හෝ වැරදි දිශාවට ගියොත් condition එක කිසිදා false නොවේ.",
            "fix": "loop එකේ අවසානයේ i++ (අවශ්‍ය නම් i--) එක් කරන්න.",
            "tip": "ඉදිරියට පියවරක් නොතැබුවොත් finish line එකට කිසිදා ළඟා නොවේ.",
        },
        "singlish": {
            "summary": "Loop counter eka hariyata wenas wenne na, ehema nisa loop eka nawathinne nathuwa yanna puluwan.",
            "why": "Counter eka (i) wenas nowunoth hari waradi paththata giyoth condition eka kawadawath false wenne na.",
            "fix": "Loop eke anthimata i++ (one nam i--) danna.",
            "tip": "Issarahata adiyak thiyanne nathnam finish line ekata yanna be.",
        },
    },
    "LOOP_CONTROL_FLOW_ISSUE": {
        "si": {
            "summary": "break, continue හෝ loop keyword එක වැරදි ලෙස භාවිතා කර ඇත.",
            "why": "break මගින් loop එක සම්පූර්ණයෙන් නවතියි, continue මගින් එම වාරය පමණක් මඟ හරියි. sleep, pause වැනි වචන Java keywords නොවේ.",
            "fix": "එක් වාරයක් මඟ හැරීමට continue, loop එක නැවැත්වීමට break, අවම වශයෙන් එක් වරක් ධාවනය වීමට do-while භාවිතා කරන්න.",
            "tip": "break = loop එකෙන් පිටවීම, continue = ඊළඟ වාරයට පැනීම.",
        },
        "singlish": {
            "summary": "break, continue hari loop keyword eka waradi widihata use karala thiyenawa.",
            "why": "break eken loop eka sampurnayenma nawaththanawa, continue eken e round eka witharai skip karanne. sleep, pause wage words Java keywords newei.",
            "fix": "Eka round ekak skip karanna continue, loop eka nawaththanna break, eka parak hari run wenna do-while use karanna.",
            "tip": "break = loop eken eliyata, continue = ilanga round ekata.",
        },
    },
    "ARRAY_BOUNDARY_INDEX_ISSUE": {
        "si": {
            "summary": "array එකේ index එක, declaration එක හෝ length ලියන ආකාරය වැරදියි.",
            "why": "Java arrays 0 සිට ආරම්භ වේ, එබැවින් වලංගු index 0 සිට length - 1 දක්වා පමණි. array type එක int[] ලෙසත්, ප්‍රමාණය arr.length ලෙසත් (වරහන් නැතිව) ලිවිය යුතුය.",
            "fix": "පළමු element එකට arr[0], අවසාන එකට arr[arr.length - 1] භාවිතා කරන්න.",
            "tip": "array එකක් lockers පේළියක් වගේ: පළමු locker එකේ අංකය 0 යි.",
        },
        "singlish": {
            "summary": "Array eke index eka, declaration eka hari length liyana widiha waradi.",
            "why": "Java arrays 0 indan patan gannawa, ehema nisa valid index 0 indan length - 1 wenakan witharai. Array type eka int[] widihata, size eka arr.length widihata (brackets nathuwa) liyanna one.",
            "fix": "Palaweni element ekata arr[0], anthima ekata arr[arr.length - 1] use karanna.",
            "tip": "Array ekak lockers pelak wage: palaweni locker eke number eka 0.",
        },
    },
    "ARRAY_TRAVERSAL_ISSUE": {
        "si": {
            "summary": "array එක හරහා යන loop එක සියලු element නිවැරදිව පරීක්ෂා නොකරයි.",
            "why": "වැරදි ආරම්භය, වැරදි condition එක හෝ වැරදි update එක නිසා element මඟ හැරේ, නැතහොත් වැරදි element කියවේ.",
            "fix": "සම්මත ආකාරය භාවිතා කරන්න: for (int i = 0; i < arr.length; i++) සහ arr[i] කියවන්න.",
            "tip": "සෑම element එකක්ම හරියටම එක් වරක් බලන්න.",
        },
        "singlish": {
            "summary": "Array eka haraha yana loop eka hama element ekakatama hariyata yanne na.",
            "why": "Waradi start eka, waradi condition eka hari waradi update eka nisa elements skip wenawa, nathnam waradi element kiyawenawa.",
            "fix": "Standard widiha use karanna: for (int i = 0; i < arr.length; i++) saha arr[i] kiyawanna.",
            "tip": "Hama element ekakma hariyatama eka parak balanna.",
        },
    },
    "METHOD_SIGNATURE_ISSUE": {
        "si": {
            "summary": "method එක call කරන විට දෙන arguments, parameters සමඟ නොගැළපේ.",
            "why": "method එකක් ඉල්ලන ගණනටම සහ type එකටම arguments දිය යුතුය. උදා: int parameter එකකට \"4\" වැනි String එකක් දිය නොහැක.",
            "fix": "method declaration එක සහ call එක සසඳා, arguments ගණන සහ type ගළපන්න.",
            "tip": "method එකක් machine එකක් වගේ: එය ඉල්ලන දේම ලබා දෙන්න.",
        },
        "singlish": {
            "summary": "Method eka call karaddi dena arguments, parameters ekka galapenne na.",
            "why": "Method ekak illana gananatama saha type ekatama arguments denna one. E.g. int parameter ekakata \"4\" wage String ekak denna be.",
            "fix": "Method declaration eka saha call eka compare karala, arguments ganana saha type galapanna.",
            "tip": "Method ekak machine ekak wage: eka illana dewalma denna.",
        },
    },
    "METHOD_RETURN_ISSUE": {
        "si": {
            "summary": "method එකේ return කිරීම හෝ return type එක වැරදියි.",
            "why": "int වැනි type එකක් ඇති method එකක් return value; භාවිතා කළ යුතු අතර void method එකකට value එකක් return කළ නොහැක. recursion එකක base case එක නිවැරදි අගය return කළ යුතුය.",
            "fix": "return type එක පරීක්ෂා කර, අවශ්‍ය තැන return keyword එක සමඟ නිවැරදි value එක ආපසු දෙන්න.",
            "tip": "print කිරීම යනු තිරයේ පෙන්වීමයි; return කිරීම යනු value එක call කළ තැනට ආපසු දීමයි.",
        },
        "singlish": {
            "summary": "Method eke return karana eka hari return type eka waradi.",
            "why": "int wage type ekak thiyena method ekak return value; use karanna one, void method ekakata value ekak return karanna be. Recursion eke base case eka hari value eka return karanna one.",
            "fix": "Return type eka check karala, one thana return keyword eka ekka hari value eka aapahu denna.",
            "tip": "Print kiyanne screen eke pennana eka; return kiyanne value eka call karapu thanata aapahu dena eka.",
        },
    },
    "METHOD_PARAMETER_USAGE_ISSUE": {
        "si": {
            "summary": "method එක තම parameters නිවැරදිව භාවිතා නොකරයි.",
            "why": "parameter එකක් නොසලකා හැරීම හෝ recursive call එකට වැරදි argument එකක් දීම නිසා ප්‍රතිඵලය වැරදි වේ, නැතහොත් recursion නතර නොවේ.",
            "fix": "සෑම parameter එකක්ම body එකේ භාවිතා වන බවත්, recursive call එක base case එක දෙසට (උදා: n - 1) යන බවත් තහවුරු කරන්න.",
            "tip": "එක් එක් call එකේ n අගය ලියා බලා, එය base case එකට ළඟා වේදැයි බලන්න.",
        },
        "singlish": {
            "summary": "Method eka thamange parameters hariyata use karanne na.",
            "why": "Parameter ekak ignore kirima hari recursive call ekata waradi argument ekak dima nisa result eka waradi wenawa, nathnam recursion eka nawathinne na.",
            "fix": "Hama parameter ekakma body eke use wenawada, recursive call eka base case ekata (e.g. n - 1) langa wenawada kiyala check karanna.",
            "tip": "Eka eka call eke n value eka liyala, eka base case ekata yanawada balanna.",
        },
    },
}

# The 12th group, CORRECT_NO_ERROR, is the correct-answer case below.
CORRECT_TEXT = {
    "si": {
        "summary": "නියමයි! '{opt}' නිවැරදි පිළිතුරයි.",
        "why": "ඔබේ පිළිතුර answer key එකට ගැළපෙන අතර, code එක බලාපොරොත්තු වූ ලෙසම ක්‍රියා කරයි.",
        "fix": "කිසිවක් නිවැරදි කිරීමට අවශ්‍ය නැත.",
        "tip": "මෙම රටාව පුරුදු වන තෙක් දිගටම පුහුණු වන්න.",
    },
    "singlish": {
        "summary": "Niyamai! '{opt}' hari uththaraya.",
        "why": "Oyage uththaraya answer key ekata galapenawa, code ekath balaporoththu una widihatama wada karanawa.",
        "fix": "Kisima deyak hadanna one na.",
        "tip": "Me pattern eka purudu wenakan digatama practice karanna.",
    },
}

# Wrong answer with no C2 label (text-only questions, e.g. Operators).
TEXT_QUESTION_TEXT = {
    "si": {
        "summary": "'{opt}' මෙහි නිවැරදි නැත. නිවැරදි පිළිතුර '{correct}' යි.",
        "why": "ඔබ තෝරාගත් පිළිතුර ප්‍රශ්නය අසන දෙයට නොගැළපේ. operator එකේ හෝ keyword එකේ තේරුම නැවත කියවා බලන්න.",
        "fix": "'{correct}' තෝරන්න.",
        "tip": "එක් එක් විකල්පය කුඩා උදාහරණයකින් පරීක්ෂා කර බලන්න.",
    },
    "singlish": {
        "summary": "'{opt}' meke hari na. Hari uththaraya '{correct}'.",
        "why": "Oya thorapu uththaraya prashnaya ahana deyata galapenne na. Operator eke hari keyword eke theruma aye kiyawala balanna.",
        "fix": "'{correct}' thoranna.",
        "tip": "Eka eka option eka podi example ekakin check karala balanna.",
    },
}

WRONG_PREFIX = {"si": "'{opt}' මෙහි නිවැරදි නැත. ", "singlish": "'{opt}' meke hari na. "}
FIX_PREFIX = {"si": "'{correct}' භාවිතා කරන්න. ", "singlish": "'{correct}' use karanna. "}

_COMPILE_SI = {
    "summary": "'{opt}' compile වන්නේ නැත: {ce}.",
    "why": "Java compiler කියන්නේ: {ce}.",
    "fix": "{fix_prefix}compile error eka fix karanna.",
    "tip": "Compiler message eka බලන්න — ඒකේ exact problem eka කියා ඇත.",
}
_COMPILE_SINGLISH = {
    "summary": "'{opt}' compile wenne na: {ce}.",
    "why": "Java compiler kiyanawa: {ce}.",
    "fix": "{fix_prefix}Compile error eka fix karanna.",
    "tip": "Compiler message eka balanna — eke exact problem eka kiyala thiyenawa.",
}


def compile_template(lang, compile_error, opt="", correct=""):
    """Template when the student's code fails to compile. Uses the real compiler message."""
    src = _COMPILE_SI if lang == "si" else _COMPILE_SINGLISH
    fix_prefix = (FIX_PREFIX[lang].format(opt=opt, correct=correct) if correct else "")
    return {k: v.format(opt=opt, ce=compile_error, fix_prefix=fix_prefix) for k, v in src.items()}


def localised_template(lang, kind, reason_group=None, opt="", correct=""):
    """
    {summary, why, fix, tip} in `lang` ("si" | "singlish").
    kind: "correct" | "group" (wrong answer with a C2 reason group) | "text" (no label).
    """
    fmt = {"opt": opt, "correct": correct or ""}
    if kind == "correct":
        return {k: v.format(**fmt) for k, v in CORRECT_TEXT[lang].items()}
    if kind == "group" and reason_group in GROUP_TEXT:
        g = GROUP_TEXT[reason_group][lang]
        return {
            "summary": WRONG_PREFIX[lang].format(**fmt) + g["summary"],
            "why": g["why"],
            "fix": (FIX_PREFIX[lang].format(**fmt) if correct else "") + g["fix"],
            "tip": g["tip"],
        }
    out = {k: v.format(**fmt) for k, v in TEXT_QUESTION_TEXT[lang].items()}
    if not correct:
        out["summary"] = WRONG_PREFIX[lang].format(**fmt).strip()
        out["fix"] = TEXT_QUESTION_TEXT[lang]["tip"]
    return out
