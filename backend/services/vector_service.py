import math
import re
from typing import List, Dict, Any

class VectorService:
    """Lightweight TF-IDF / Vector chunking engine for codebase RAG search."""

    @staticmethod
    def chunk_code_file(filepath: str, content: str, chunk_size: int = 40) -> List[Dict[str, Any]]:
        lines = content.splitlines()
        chunks = []
        for i in range(0, len(lines), chunk_size):
            chunk_lines = lines[i:i + chunk_size]
            chunk_text = "\n".join(chunk_lines)
            if chunk_text.strip():
                chunks.append({
                    "file_path": filepath,
                    "start_line": i + 1,
                    "end_line": i + len(chunk_lines),
                    "content": chunk_text
                })
        return chunks

    @staticmethod
    def search_codebase(query: str, chunks: List[Dict[str, Any]], top_k: int = 4) -> List[Dict[str, Any]]:
        """Simple keyword TF-IDF relevance scoring for chunks."""
        query_terms = [t.lower() for t in re.findall(r'\w+', query) if len(t) > 2]
        if not query_terms:
            return chunks[:top_k]

        scored_chunks = []
        for chunk in chunks:
            text_lower = chunk["content"].lower() + " " + chunk["file_path"].lower()
            score = sum(text_lower.count(term) for term in query_terms)
            if score > 0:
                scored_chunks.append((score, chunk))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [c[1] for c in scored_chunks[:top_k]] if scored_chunks else chunks[:top_k]
