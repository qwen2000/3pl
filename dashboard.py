import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import datetime
import re

# ==========================================
# 1. Page Configuration
# ==========================================
st.set_page_config(
    page_title="3PL AI Capacity Center",
    page_icon="📦",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ==========================================
# 2. Helper Functions
# ==========================================
def mask_name(name):
    name = str(name).strip()
    if len(name) <= 2: return name[0] + "*" + name[-1] if len(name) == 2 else name
    return name[0] + "***" + name[-1]


def clean_category_name(name):
    name = str(name)
    name = name.replace("长尾杂项", "Misc")
    name = re.sub(r'[\u4e00-\u9fff]+', '', name)
    name = name.replace("__", "_").replace("  ", " ").strip("_ ")
    return name if name else "Unknown Category"


def truncate_dests(x, limit=3):
    dests = sorted(set(x))
    if len(dests) <= limit: return ', '.join(dests)
    return ', '.join(dests[:limit]) + f' +{len(dests) - limit} more'


# ==========================================
# 3. Load Data
# ==========================================
@st.cache_data
def load_data():
    try:
        df_forecast = pd.read_csv('3PL_Final_Forecast_Report.csv')
        df_forecast = df_forecast.sort_values(by='Week +1_Vol', ascending=False)
        df_forecast['Category'] = df_forecast['Category'].apply(clean_category_name)
        df_forecast['Customer_Masked'] = df_forecast['Customer'].apply(mask_name)
    except:
        st.error("Forecast report not found.")
        df_forecast = pd.DataFrame()

    try:
        df_agg = pd.read_csv('3pl_weekly_aggregated.csv')
        df_agg['Create Date'] = pd.to_datetime(df_agg['Create Date'])
        total_trend = df_agg.groupby('Create Date')['Weekly_Volume'].sum().reset_index()
        total_trend.rename(columns={'Create Date': 'Date', 'Weekly_Volume': 'Total Volume'}, inplace=True)
    except:
        total_trend = pd.DataFrame(columns=['Date', 'Total Volume'])

    return df_forecast, total_trend


df_forecast, df_trend = load_data()

# ==========================================
# 4. Sidebar with Clear Date Logic
# ==========================================
st.sidebar.header("⚙️ Control Panel")
st.sidebar.markdown("---")

# Calculate the actual data end date to anchor predictions
if not df_trend.empty:
    data_end_date = df_trend['Date'].max().date()
else:
    data_end_date = datetime.date.today()

st.sidebar.subheader("Prediction Anchor")
st.sidebar.info(f"Model forecast based on data up to:\n**{data_end_date.strftime('%Y-%m-%d')}**")

# Map abstract "Week +X" to actual Calendar Dates
week_mapping = {
    'Week +1': data_end_date + datetime.timedelta(weeks=1),
    'Week +2': data_end_date + datetime.timedelta(weeks=2),
    'Week +3': data_end_date + datetime.timedelta(weeks=3),
    'Week +4': data_end_date + datetime.timedelta(weeks=4)
}

st.sidebar.subheader("View Window")
start_date = st.sidebar.date_input("View Start Date", week_mapping['Week +1'])
end_date = st.sidebar.date_input("View End Date", week_mapping['Week +4'])

valid_weeks = [wk for wk, dt in week_mapping.items() if start_date <= dt <= end_date]

st.sidebar.markdown("---")
st.sidebar.subheader("Data Filters")
selected_dest = st.sidebar.multiselect("Destination Country", df_forecast['Destination'].unique(),
                                       default=df_forecast['Destination'].unique())

# ==========================================
# 5. Main Page Header
# ==========================================
st.title("📦 3PL AI Capacity Intelligence Center")
st.caption(
    f"Last Model Inference: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')} | Engine: Multimodal Transformer v2.0")

# ==========================================
# 6. Panel 1: Market Overview
# ==========================================
st.header("📈 Market Overview & Demand Prediction")

col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("Overall Market Volume Trend")
    if not df_trend.empty:
        fig_trend = px.line(df_trend, x='Date', y='Total Volume',
                            labels={'Total Volume': 'Weekly Volume', 'Date': 'Week'}, line_shape="spline")
        fig_trend.update_traces(line_color='#5D9CEC', line_width=3, fill='tonexty', fillcolor='rgba(93,156,236,0.1)')
        fig_trend.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)', hovermode="x unified")
        st.plotly_chart(fig_trend, use_container_width=True)

with col2:
    st.subheader("Category Mix (Next Wk)")
    if not df_forecast.empty:
        cat_vol = df_forecast.groupby('Category')['Week +1_Vol'].sum().reset_index().sort_values(by='Week +1_Vol',
                                                                                                 ascending=False).head(
            10)
        fig_pie = px.pie(cat_vol, values='Week +1_Vol', names='Category', hole=0.4,
                         color_discrete_sequence=px.colors.sequential.Blues_r)
        fig_pie.update_traces(textposition='inside', textinfo='percent+label', textfont_size=10)
        fig_pie.update_layout(showlegend=False, margin=dict(t=20, b=20, l=20, r=20))
        st.plotly_chart(fig_pie, use_container_width=True)

st.markdown("---")

# ==========================================
# 7. Client-Level Aggregation Logic
# ==========================================
df_client_agg = df_forecast.groupby('Customer_Masked').agg({
    'Destination': lambda x: truncate_dests(x, 3),
    'Week +1_Vol': 'sum', 'Week +1_Wt': 'sum',
    'Week +2_Vol': 'sum', 'Week +2_Wt': 'sum',
    'Week +3_Vol': 'sum', 'Week +3_Wt': 'sum',
    'Week +4_Vol': 'sum', 'Week +4_Wt': 'sum'
}).reset_index()

df_client_agg['Decline_Rate'] = (df_client_agg['Week +4_Vol'] - df_client_agg['Week +1_Vol']) / (
            df_client_agg['Week +1_Vol'] + 1e-8)

# ==========================================
# 8. Tabs: Procurement & Client Forecast
# ==========================================
tab1, tab2 = st.tabs(["🛒 Procurement Recommendation", "📊 Client 4-Week Forecast"])

with tab1:
    df_filtered_entities = df_forecast[df_forecast['Destination'].isin(selected_dest)]
    df_client_filtered = df_filtered_entities.groupby('Customer_Masked').agg({
        'Destination': lambda x: truncate_dests(x, 3),
        'Week +1_Vol': 'sum', 'Week +1_Wt': 'sum'
    }).reset_index()

    df_client_filtered['Current_Capacity'] = (df_client_filtered['Week +1_Vol'] * 0.8).astype(int)
    df_client_filtered['Capacity_Gap'] = df_client_filtered['Week +1_Vol'] - df_client_filtered['Current_Capacity']
    df_client_filtered['Action'] = df_client_filtered['Capacity_Gap'].apply(
        lambda x: f"Procure +{int(x)} Slots" if x > 0 else "Sufficient")

    df_client_display = df_client_filtered.merge(df_client_agg[['Customer_Masked', 'Decline_Rate']],
                                                 on='Customer_Masked', how='left')

    col_tab1_left, col_tab1_right = st.columns([2.5, 1])

    with col_tab1_left:
        st.subheader("Client-Level Capacity Gap Analysis")

        display_cols = ['Customer_Masked', 'Destination', 'Week +1_Vol', 'Current_Capacity', 'Capacity_Gap', 'Action',
                        'Week +1_Wt']
        rename_map = {
            'Customer_Masked': 'Client ID', 'Destination': 'Key Dest.',
            'Week +1_Vol': f'AI Pred. (W+1)',
            'Current_Capacity': 'Allocated Cap.', 'Capacity_Gap': 'Gap',
            'Action': 'Procurement Rec.', 'Week +1_Wt': 'Est. Weight (Kg)'
        }
        df_show = df_client_display[display_cols].rename(columns=rename_map)


        def highlight_gap(val):
            if val > 0:
                return 'background-color: #FFDEDE; color: #C0392B'
            else:
                return 'background-color: #D4EDDA; color: #155724'


        styled_df = df_show.style.format({
            'AI Pred. (W+1)': '{:,.0f}', 'Allocated Cap.': '{:,.0f}',
            'Gap': '{:,.0f}', 'Est. Weight (Kg)': '{:,.2f}'
        }).map(highlight_gap, subset=['Gap'])

        st.dataframe(styled_df, use_container_width=True, height=450)
        csv = df_show.to_csv(index=False).encode('utf-8')
        st.download_button("📥 Export POs to CSV", csv, "client_procurement_plan.csv", "text/csv", key='download-pos')

    with col_tab1_right:
        st.subheader("⚠️ Client Anomalies")
        st.markdown("**🚨 Urgent Procurement**")
        top_gaps = df_client_display.nlargest(3, 'Capacity_Gap')
        for _, row in top_gaps.iterrows():
            st.error(f"**{row['Customer_Masked']}**\nNeed +{int(row['Capacity_Gap'])} slots")

        st.markdown("---")
        st.markdown("**📉 Demand Drop Warning**")
        top_drops = df_client_display.nsmallest(3, 'Decline_Rate')
        for _, row in top_drops.iterrows():
            drop_pct = row['Decline_Rate'] * 100
            if drop_pct < -10:
                st.warning(f"**{row['Customer_Masked']}**\nTrend to W+4: {drop_pct:.1f}%")

with tab2:
    st.subheader("Top 10 Clients by Next Week Volume")

    if not df_forecast.empty:
        # 构建列顺序、重命名映射 和 格式化字典
        ordered_cols = ['Customer_Masked', 'Destination']
        dynamic_rename = {'Customer_Masked': 'Client ID', 'Destination': 'Key Dest.'}
        format_dict = {}
        vol_display_cols = []  # 收集 Vol 列的新名称，用于着色
        wt_display_cols = []  # 👉 新增：收集 Wt 列的新名称，用于着色

        for i in range(1, 5):
            wk_label = f'Week +{i}'
            if wk_label in valid_weeks:
                v_col = f'{wk_label}_Vol'
                w_col = f'{wk_label}_Wt'

                # 1. 记录原始列，用于从 df_client_agg 中取数
                ordered_cols.append(v_col)
                ordered_cols.append(w_col)

                # 2. 生成新的展示列名
                dt_str = week_mapping[wk_label].strftime("%m/%d")
                new_v_col = f'Vol (W+{i} {dt_str})'
                new_w_col = f'Wt (W+{i} {dt_str}, kg)'

                # 3. 记录重命名映射
                dynamic_rename[v_col] = new_v_col
                dynamic_rename[w_col] = new_w_col

                # 4. 格式化字典的 Key 使用【新列名】
                format_dict[new_v_col] = '{:,.0f}'  # Vol 整数
                format_dict[new_w_col] = '{:,.2f}'  # Wt 两位小数

                # 👉 收集不同类型列的新名称
                vol_display_cols.append(new_v_col)
                wt_display_cols.append(new_w_col)

        # 截取 Top 10
        client_top10 = df_client_agg[ordered_cols].sort_values(
            by=ordered_cols[2] if len(ordered_cols) > 2 else 'Week +1_Vol', ascending=False
        ).head(10)

        # 先 rename DataFrame
        client_top10_renamed = client_top10.rename(columns=dynamic_rename)

        # 👉 核心升级：链式调用两次 background_gradient，分别应用不同色系
        styled_client = client_top10_renamed.style.format(format_dict) \
            .background_gradient(
            subset=vol_display_cols,
            cmap='Blues',  # 蓝色渐变代表单量
            axis=0
        ) \
            .background_gradient(
            subset=wt_display_cols,
            cmap='Greens',  # 👉 新增：绿色渐变代表重量
            axis=0
        )

        st.dataframe(styled_client, use_container_width=True)

        col_exp1, col_exp2 = st.columns([4, 1])
        with col_exp2:
            csv_client = client_top10_renamed.to_csv(index=False).encode('utf-8')
            st.download_button("📥 Export All Clients", csv_client, "client_4week_forecast.csv", "text/csv",
                               key='download-cat')