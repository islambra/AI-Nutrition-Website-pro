import addIcon from "./square-pen.svg"
import messagesicon from "./messages-square.svg"
import listIcon from "./list.svg"
import addUsers from "./user-plus.svg"
import allUsers from "./users.svg"
import userInfo from "./file-user.svg"

export const assets = {
  addIcon,
  listIcon,
  messagesicon,
  addUsers,
  allUsers,
  userInfo
}
export const nutritionistMenuLinks = [
  { name: "Create Blog", path: "/nutritionist/create-blog", icon: addIcon },
  { name: "Contact Messages", path: "/nutritionist/contact-messages", icon: messagesicon },
  { name: "All Patient", path: "/nutritionist/all-patient", icon: allUsers },
  { name: "My Profile", path: "/nutritionist/my-Profile", icon: userInfo },
];
export const adminMenuLinks = [
  { name: "Add Admin/Nutritionist", path: "/admin/add-admin-nutritionist", icon: addUsers },
  { name: "All Users", path: "/admin/all-users", icon: allUsers },
  { name: "My Profile", path: "/admin/my-Profile", icon: userInfo },
];
