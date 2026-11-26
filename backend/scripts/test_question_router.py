import asyncio

from app.integrations.llm.dependencies import get_chat_model
from app.modules.chat.services.question_router import QuestionRouter

TEST_CASES = [
    {
        "question": "What are the requirements for a work visa?",
        "expected": ["migration"],
    },
    {
        "question": "How can I verify a recruiting agency license?",
        "expected": ["agency"],
    },
    {
        "question": "What jobs are available in Saudi Arabia?",
        "expected": ["job"],
    },
    {
        "question": "What is the migration cost through this agency?",
        "expected": ["migration", "agency"],
    },
    {
        "question": "What are the available jobs in Saudi Arabia and what work visa is required?",
        "expected": ["job", "migration"],
    },
    {
        "question": (
            "What jobs are available in Saudi Arabia, "
            "and how can I verify the recruiting agency's license?"
        ),
        "expected": ["job", "agency"],
    },
    {
        "question": "Hello, how are you?",
        "expected": ["general"],
    },
]


async def main():
    model = get_chat_model()
    router = QuestionRouter(model)

    for index, test in enumerate(TEST_CASES, start=1):
        result = await router.route(test["question"])

        actual = {item.value for item in result.question_types}
        expected = set(test["expected"])

        passed = actual == expected

        print(f"\nTest {index}: {'PASSED' if passed else 'FAILED'}")
        print(f"Question: {test['question']}")
        print(f"Expected: {sorted(expected)}")
        print(f"Actual: {sorted(actual)}")
        print(f"Reasoning: {result.reasoning}")


if __name__ == "__main__":
    asyncio.run(main())