from langchain_ollama import ChatOllama
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from rag import get_legal_guidance

llm = ChatOllama(model="haqai-model", base_url="http://127.0.0.1:11434")

@tool
def legal_search(query: str) -> str:
    """Search Pakistani legal documents including Pakistan Penal Code 
    and court judgments to find relevant laws, sections, and punishments."""
    return get_legal_guidance(query)

@tool
def classify_case(description: str) -> str:
    """Classify a legal case into categories like murder, theft, 
    fraud, assault, property dispute etc."""
    prompt = f"""Classify this legal case into ONE category:
Murder, Theft, Fraud, Assault, Property Dispute, Family Law, Other

Case: {description}

Reply with category name and relevant PPC section only."""
    return llm.invoke(prompt).content

tools = [legal_search, classify_case]

# Initialize MemorySaver checkpointer for conversation memory
memory = MemorySaver()

# Pass checkpointer to create_react_agent
agent_executor = create_react_agent(llm, tools, checkpointer=memory)

def run_agent(query: str, thread_id: str = "default-session") -> str:
    # Pass thread_id configuration to track session-specific conversation history
    config = {"configurable": {"thread_id": thread_id}}
    result = agent_executor.invoke({"messages": [("user", query)]}, config=config)
    last_message = result["messages"][-1]
    return last_message.content