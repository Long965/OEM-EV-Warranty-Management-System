import Tables from "layouts/tables";
import Alerts from "layouts/alerts";
import Allocations from "layouts/allocations";
import Dashboard from "layouts/dashboard";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    route: "/dashboard",
    component: <Dashboard />,
    icon: "dashboard",
  },
  {
    type: "collapse",
    name: "Parts",
    key: "tables",
    route: "/tables",
    component: <Tables />,
    icon: "inventory",
  },
  {
    type: "collapse",
    name: "Allocations",
    key: "allocations",
    route: "/allocations",
    component: <Allocations />,
    icon: "local_shipping",
  },
  {
    type: "collapse",
    name: "Alerts",
    key: "alerts",
    route: "/alerts",
    component: <Alerts />,
    icon: "warning",
  },
];

export default routes;
