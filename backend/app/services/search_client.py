import logging
from typing import Any, Dict, List

import httpx
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS


logger = logging.getLogger(__name__)


def search_web(
    query: str,
    max_results: int = 5,
) -> List[Dict[str, Any]]:
    """
    Search the web for product information.

    Returns lightweight search results.
    """

    if not query.strip():
        return []

    logger.info(
        "Searching web for: %s",
        query,
    )

    results = []

    # Attempt 1: Try using the library
    try:
        with DDGS() as ddgs:
            search_results = ddgs.text(
                query,
                max_results=max_results,
                backend="lite",
            )

            for item in search_results:
                results.append(
                    {
                        "title": item.get("title"),
                        "url": item.get("href"),
                        "snippet": item.get("body"),
                    }
                )

    except Exception as exc:
        logger.warning(
            "Library search failed: %s",
            exc,
        )

    # Attempt 2: Direct BeautifulSoup scraping fallback if library failed or returned empty results
    if not results:
        try:
            import urllib.parse
            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                )
            }
            response = httpx.get(
                "https://lite.duckduckgo.com/lite/",
                params={"q": query},
                headers=headers,
                timeout=10,
            )
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")
                a_tags = soup.find_all("a", class_="result-link")
                for a in a_tags[:max_results]:
                    title = a.get_text(strip=True)
                    raw_href = a.get("href", "")
                    
                    # Resolve DDG redirect URL
                    url = raw_href
                    if "uddg=" in raw_href:
                        parsed = urllib.parse.urlparse(raw_href)
                        qs = urllib.parse.parse_qs(parsed.query)
                        if "uddg" in qs:
                            url = qs["uddg"][0]
                    
                    snippet = ""
                    tr = a.find_parent("tr")
                    if tr:
                        next_tr = tr.find_next_sibling("tr")
                        if next_tr:
                            snippet_td = next_tr.find("td", class_="result-snippet")
                            if snippet_td:
                                snippet = snippet_td.get_text(strip=True)
                    
                    results.append(
                        {
                            "title": title,
                            "url": url,
                            "snippet": snippet,
                        }
                    )
        except Exception as exc:
            logger.warning(
                "Manual fallback search failed: %s",
                exc,
            )

    return results


def fetch_page_text(
    url: str,
    max_chars: int = 10000,
) -> str:
    """
    Fetch a web page and extract readable text.
    """

    if not url:
        return ""

    try:

        headers = {
            "User-Agent": (
                "Mozilla/5.0 "
                "(compatible; UniHackBot/1.0)"
            )
        }

        response = httpx.get(
            url,
            headers=headers,
            timeout=10,
            follow_redirects=True,
        )

        response.raise_for_status()

        soup = BeautifulSoup(
            response.text,
            "html.parser",
        )

        for element in soup(
            [
                "script",
                "style",
                "nav",
                "footer",
                "header",
            ]
        ):
            element.decompose()

        text = soup.get_text(
            separator=" ",
            strip=True,
        )

        return text[:max_chars]

    except Exception as exc:

        logger.warning(
            "Failed to fetch %s: %s",
            url,
            exc,
        )

        return ""
