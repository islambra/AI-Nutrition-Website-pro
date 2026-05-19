import addIcon from "./square-pen.svg"
import messagesicon from "./messages-square.svg"
import listIcon from "./list.svg"
import addUsers from "./user-plus.svg"
import allUsers from "./users.svg"
import userInfo from "./file-user.svg"
import updateIcon from "./file-pen.svg"
import Consultation from "./calendar-plus.svg"
import payment from "./banknote-arrow-down.svg"


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
  { name: "Create Plan", path: "/nutritionist/create-plan", icon: addIcon },
  { name: "My Plans", path: "/nutritionist/MyPlans", icon: updateIcon },
  { name: "My Blogs", path: "/nutritionist/MyBlogs", icon: updateIcon },
  { name: "Consultation Requests", path: "/nutritionist/consultation-requests", icon: Consultation },
  { name: "Payments", path: "/nutritionist/payments", icon: payment },
  { name: "Contact Messages", path: "/nutritionist/contact-messages", icon: messagesicon },
  { name: "All Clients", path: "/nutritionist/all-clients", icon: allUsers },
  { name: "My Profile", path: "/nutritionist/my-Profile", icon: userInfo },
];
export const adminMenuLinks = [
  { name: "Add Admin/Nutritionist", path: "/admin/add-admin-nutritionist", icon: addUsers },
  { name: "All Users", path: "/admin/all-users", icon: allUsers },
  { name: "Payments", path: "/admin/payments", icon: payment },
  { name: "My Profile", path: "/admin/my-Profile", icon: userInfo },
];
