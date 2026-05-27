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

col1, col2 = st.columns(2)

with col1:
    st.info("🧠 Module 1: 3PL Volume Forecast")
    st.write("3PL AI Capacity Intelligence Center")
    if st.button("Volume Forecast Dashboard", key="btn1"):
        st.switch_page(dashboard_page)

with col2:
    st.info("⚙️ Module 2: SCM Operation Center")
    st.write("SCM Operation Center")
    if st.button("SCM Operation Panel", key="btn2"):
        st.switch_page(scm_page)