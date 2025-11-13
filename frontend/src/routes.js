/* eslint-disable prettier/prettier */
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables"; // Parts
import Suppliers from "layouts/suppliers";
import Inventory from "layouts/inventory";
import Allocations from "layouts/allocations";
import Alerts from "layouts/alerts";
import Vehicles from "layouts/vehicles";
import Assignments from "layouts/assignments";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Parts",
    key: "parts",
    icon: <Icon fontSize="small">inventory_2</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Suppliers",
    key: "suppliers",
    icon: <Icon fontSize="small">store</Icon>,
    route: "/suppliers",
    component: <Suppliers />,
  },
  {
    type: "collapse",
    name: "Inventory",
    key: "inventory",
    icon: <Icon fontSize="small">warehouse</Icon>,
    route: "/inventory",
    component: <Inventory />,
  },
  {
    type: "collapse",
    name: "Allocations",
    key: "allocations",
    icon: <Icon fontSize="small">local_shipping</Icon>,
    route: "/allocations",
    component: <Allocations />,
  },
  {
    type: "collapse",
    name: "Alerts",
    key: "alerts",
    icon: <Icon fontSize="small">warning</Icon>,
    route: "/alerts",
    component: <Alerts />,
  },
  {
    type: "collapse",
    name: "Vehicles",
    key: "vehicles",
    icon: <Icon fontSize="small">directions_car</Icon>,
    route: "/vehicles",
    component: <Vehicles />,
  },
  {
    type: "collapse",
    name: "Assignments",
    key: "assignments",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/assignments",
    component: <Assignments />,
  },
];

export default routes;
