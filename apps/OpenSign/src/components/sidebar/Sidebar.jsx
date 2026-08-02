import { useState, useEffect } from "react";
import Parse from "parse";
import Menu from "./Menu";
import Submenu from "./SubMenu";
import sidebarList, { subSetting } from "../../json/menuJson";
import { useDispatch, useSelector } from "react-redux";
import { useWindowSize } from "../../hook/useWindowSize";
import {
  setSelectedMenu,
  toggleSidebar
} from "../../redux/reducers/sidebarReducer";

const Sidebar = () => {
  const { width } = useWindowSize();
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const [menuList, setmenuList] = useState([]);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("accesstoken")) {
      menuItem();
    }
  }, []);

  const closeSidebar = () => {
    dispatch(setSelectedMenu(true));
    if (width <= 1023) {
      dispatch(toggleSidebar(false));
    }
  };

  const menuItem = async () => {
    try {
      if (localStorage.getItem("defaultmenuid")) {
        const Extand_Class = localStorage.getItem("Extand_Class");
        const extClass = Extand_Class && JSON.parse(Extand_Class);
        const userRole = extClass?.[0]?.UserRole || "contracts_User";
        const isAdmin =
          userRole === "contracts_Admin" || userRole === "contracts_OrgAdmin";

        // Free/Pro are single-user plans (see PlanUtils.assertCanAddTeamMember,
        // which already blocks adding a second user server-side) — hiding the
        // Users menu for them instead of showing a page that just rejects the
        // add. Defaults to hidden on error so an admin never sees a menu item
        // for a feature the server will refuse.
        let multiUser = false;
        if (isAdmin) {
          try {
            const plan = await Parse.Cloud.run("getMyPlan");
            multiUser = !!plan?.multiUser;
          } catch (e) {
            console.error("getMyPlan error", e);
          }
        }

        const newSidebarList = sidebarList.map((item) => {
          if (item.title !== "Settings") return item;
          const newItem = { ...item };
          const settingsChildren = isAdmin
            ? multiUser
              ? subSetting
              : subSetting.filter((s) => s.objectId !== "users")
            : subSetting?.slice(0, 1);
            const mysignature = newItem.children.slice(0, 1);
            newItem.children = [...mysignature, ...settingsChildren];
          return newItem;
        });
        setmenuList(newSidebarList);
      }
    } catch (e) {
      console.error("Problem", e);
    }
  };

  const toggleSubmenu = (title) => {
    dispatch(setSelectedMenu(false));
    setSubmenuOpen({ [title]: !submenuOpen[title] });
  };

  const handleMenuItem = () => {
    dispatch(setSelectedMenu(true));
    closeSidebar();
    setSubmenuOpen({});
  };
  return (
    <aside
      className={`absolute max-lg:min-h-screen lg:relative bg-base-100 overflow-y-auto transition-all z-[500] shadow-lg hide-scrollbar
     ${isOpen ? "w-full md:w-64" : "w-0"}`}
    >
      <nav
        className="op-menu op-menu-sm"
        aria-label="LDF Sign Sidebar Navigation"
      >
        <ul
          className="text-sm"
          role="menubar"
          aria-label="LDF Sign Sidebar Navigation"
        >
          {menuList.map((item) =>
            !item.children ? (
              <Menu
                key={item.title}
                item={item}
                isOpen={isOpen}
                closeSidebar={handleMenuItem}
              />
            ) : (
              <Submenu
                key={item.title}
                item={item}
                closeSidebar={closeSidebar}
                toggleSubmenu={toggleSubmenu}
                submenuOpen={submenuOpen}
              />
            )
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
