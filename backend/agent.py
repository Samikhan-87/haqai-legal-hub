from langchain_ollama import ChatOllama
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from rag import get_legal_guidance

from langchain_core.messages import SystemMessage
from llm_router import detect_language, get_language_config

llm = ChatOllama(model="haqai-model", base_url="http://127.0.0.1:11434")

@tool
def legal_search(query: str) -> str:
    """Search Pakistani legal documents including Pakistan Penal Code 
    and court judgments to find relevant laws, sections, and punishments."""
    return get_legal_guidance(query)

@tool
def classify_case(description: str) -> str:
    """Classify a legal case into categories like murder, theft, 
    assault, etc. Reply with category name and relevant PPC section only."""
    prompt = f"Classify this case: {description}"
    return llm.invoke(prompt).content

tools = [legal_search, classify_case]

# Initialize MemorySaver checkpointer
memory = MemorySaver()

def dynamic_state_modifier(state):
    """
    Dynamically injects the language instruction system prompt based on the user's query language.
    """
    messages = state.get("messages", [])
    user_query = ""
    # Find the last human query
    for msg in reversed(messages):
        if msg.type == "human":
            user_query = msg.content
            break
            
    lang = detect_language(user_query) if user_query else "english"
    lang_cfg = get_language_config(lang)
    
    system_prompt = (
        "You are HaqAI, an expert Pakistani legal assistant.\n"
        "CRITICAL RULE 1: You are NOT allowed to answer any question from your own memory. You MUST call the 'legal_search' tool for every query to find the relevant Pakistani law.\n"
        f"IMPORTANT: The user is talking to you in {lang.upper()}.\n"
        "CRITICAL RULE 2: When you call the 'legal_search' tool and get a response, you MUST output that tool response EXACTLY as it is, word-for-word. "
        "Do NOT translate it, do NOT rewrite it, do NOT paraphrase it, do NOT summarize it, and do NOT add any commentary. "
        "Your final response must be a 100% copy-paste of the legal_search tool output."
    )
    
    return [SystemMessage(content=system_prompt)] + messages

# Pass dynamic prompt generator to create_react_agent
agent_executor = create_react_agent(llm, tools, checkpointer=memory, prompt=dynamic_state_modifier)

def run_agent(query: str, thread_id: str = "default-session") -> str:
    config = {"configurable": {"thread_id": thread_id}}
    result = agent_executor.invoke({"messages": [("user", query)]}, config=config)
    last_message = result["messages"][-1]
    return last_message.content