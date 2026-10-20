"""
TF-IDF retriever over rag/knowledge_base.json
=============================================
Cosine similarity between a query and every chunk, restricted to chunks of the
question's concept (plus "General" chunks and close neighbours, e.g. Operators may
use Variables notes). The tokenizer is case-sensitive and keeps Java operators
(==, <=, ++, +=, ...) as tokens, so "Int" vs "int" or "=" vs "==" stay distinct.
"""

import json
import os
import threading

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

KB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "knowledge_base.json")

TOKEN_PATTERN = r"[A-Za-z_]\w*|\d+|===|==|!=|<=|>=|\+\+|--|\+=|-=|\*=|/=|&&|\|\||[<>=+\-*/%!]"
CONCEPT_NEIGHBOURS = {"Operators": ["Variables"]}


class Retriever:
    def __init__(self, kb_path=KB_PATH):
        with open(kb_path, encoding="utf-8") as f:
            kb = json.load(f)
        self.chunks = kb["chunks"]
        self.by_id = {c["id"]: c for c in self.chunks}
        self.questions = {c["question_id"]: c["meta"] for c in self.chunks if c["type"] == "question"}
        self.vectorizer = TfidfVectorizer(token_pattern=TOKEN_PATTERN, lowercase=False,
                                          ngram_range=(1, 2), sublinear_tf=True)
        self.matrix = self.vectorizer.fit_transform([c["text"] for c in self.chunks])

    def retrieve(self, query, concept=None, top_k=4, types=None, exclude_ids=()):
        """Top-k chunks for `query`, each as {id, type, concept, score, text}.
        `types` limits the chunk types searched (e.g. ("reason_group", "concept_note"))."""
        allowed = None
        if concept:
            allowed = {concept, "General", *CONCEPT_NEIGHBOURS.get(concept, [])}
        scores = linear_kernel(self.vectorizer.transform([query]), self.matrix)[0]
        ranked = sorted(range(len(self.chunks)), key=lambda i: -scores[i])
        out = []
        for i in ranked:
            c = self.chunks[i]
            if c["id"] in exclude_ids or (types and c["type"] not in types):
                continue
            if allowed is not None and c["concept"] not in allowed:
                continue
            out.append({"id": c["id"], "type": c["type"], "concept": c["concept"],
                        "score": round(float(scores[i]), 4), "text": c["text"]})
            if len(out) >= top_k:
                break
        return out

    def get_question(self, question_id):
        try:
            return self.questions.get(int(question_id))
        except (TypeError, ValueError):
            return None


_instance = None
_lock = threading.Lock()


def get_retriever():
    """Process-wide retriever, built on first use."""
    global _instance
    if _instance is None:
        with _lock:
            if _instance is None:
                _instance = Retriever()
    return _instance
