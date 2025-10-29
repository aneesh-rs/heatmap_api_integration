import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NoiseAndCategoryData from "../components/dashboard/NoiseAndCategoryData";
import NoiseChart from "../components/dashboard/NoiseChart";
import DashboardTable from "../components/dashboard/DashboardTable";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (user?.role === "User") {
    navigate("/");
  }
  return (
    <div className="flex flex-col sm:pl-20 bg-[#EFF0F6] h-screen overflow-y-auto">
      <div className="w-full flex flex-col sm:flex-row gap-0">
        <div className="flex-1">
          <NoiseAndCategoryData />
        </div>
        <div className="flex-1">
          <NoiseChart />
        </div>
      </div>

      <div className="w-full min-h-[400px]">
        <DashboardTable />
      </div>
    </div>
  );
}

export default Dashboard;
