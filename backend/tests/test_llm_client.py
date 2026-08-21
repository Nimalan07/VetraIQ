import pytest

from app.services.llm_client import call_llm


def test_llm_client_requires_prompt():

    with pytest.raises(ValueError):

        call_llm("")
