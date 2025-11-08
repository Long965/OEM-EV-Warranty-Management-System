// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* === TOP STATISTIC CARDS === */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon="build"
                title="Tổng phụ tùng"
                count={128}
                percentage={{
                  color: "success",
                  amount: "+5%",
                  label: "so với tháng trước",
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="factory"
                title="Nhà cung cấp"
                count={12}
                percentage={{
                  color: "success",
                  amount: "+2",
                  label: "mới trong tháng",
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="warehouse"
                title="Tổng kho hàng"
                count="3"
                percentage={{
                  color: "info",
                  amount: "",
                  label: "Hà Nội / HCM / Đà Nẵng",
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="error"
                icon="warning"
                title="Cảnh báo tồn kho"
                count="5"
                percentage={{
                  color: "error",
                  amount: "",
                  label: "cần nhập gấp",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* === CHARTS SECTION === */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Tồn kho theo kho"
                  description="Số lượng phụ tùng hiện có"
                  date="Cập nhật hôm nay"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Xuất / Nhập kho"
                  description={
                    <>
                      (<strong>+15%</strong>) tăng trong tháng này
                    </>
                  }
                  date="Cập nhật 5 phút trước"
                  chart={sales}
                />
              </MDBox>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="Hiệu suất kỹ thuật viên"
                  description="Số phụ tùng gắn theo ngày"
                  date="Cập nhật tự động"
                  chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* === LATEST ALERTS AND PROJECTS === */}
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects title="Danh sách phụ tùng sắp hết" />
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview title="Cảnh báo mới nhất" />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
