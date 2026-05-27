import streamlit as st

st.set_page_config(page_title="AI Hub", layout="wide")

st.title("Operation AI Intelligence Hub")
st.markdown("Operation AI Intelligence Hub")

# Define the pages
dashboard_page = st.Page("dashboard.py", title="3PL Dashboard")
scm_page = st.Page("scm_view.py", title="SCM Operation Center")

# You must run navigation for Streamlit to register the pages
pg = st.navigation([dashboard_page, scm_page])
pg.run()

