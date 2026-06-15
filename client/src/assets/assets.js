import addIcon from "./square-pen.svg"
import messagesicon from "./messages-square.svg"
import listIcon from "./list.svg"
import addUsers from "./user-plus.svg"
import allUsers from "./users.svg"
import userInfo from "./file-user.svg"
import updateIcon from "./file-pen.svg"
import Consultation from "./calendar-plus.svg"
import payment from "./banknote-arrow-down.svg"
import bookOpenIcon from "./book-open.svg"
import homeIcon from "./home.svg"
import clockIcon from "./clock.svg"


export const assets = {
  addIcon,
  listIcon,
  messagesicon,
  addUsers,
  allUsers,
  userInfo
}
export const dieteticienMenuLinks = [
  { name: "Create Blog", path: "/dieteticien/create-blog", icon: addIcon },
  { name: "Create Plan", path: "/dieteticien/create-plan", icon: addIcon },
  { name: "My Plans", path: "/dieteticien/MyPlans", icon: updateIcon },
  { name: "My Blogs", path: "/dieteticien/MyBlogs", icon: updateIcon },
  { name: "My Formations", path: "/dieteticien/formations", icon: listIcon },
  { name: "Consultation Requests", path: "/dieteticien/consultation-requests", icon: Consultation },
  { name: "Sales", path: "/dieteticien/payments", icon: payment },
  { name: "Payment Approvals", path: "/dieteticien/payment-approvals", icon: payment },
  { name: "Contact Messages", path: "/dieteticien/contact-messages", icon: messagesicon },
  { name: "All Clients", path: "/dieteticien/all-clients", icon: allUsers },
  { name: "My Profile", path: "/dieteticien/my-Profile", icon: userInfo },
];
export const adminMenuLinks = [
  { name: "Add Admin", path: "/admin/add-admin-nutritionist", icon: addUsers },
  { name: "All Users", path: "/admin/all-users", icon: allUsers },
  { name: "Payments", path: "/admin/payments", icon: payment },
  { name: "Manage Dieteticiens", path: "/admin/manage-dieteticiens", icon: messagesicon },
  { name: "Create Course", path: "/admin/create-course", icon: addIcon },
  { name: "All Courses", path: "/admin/all-courses", icon: listIcon },
  { name: "Course Subscriptions", path: "/admin/course-subscriptions", icon: payment },
  { name: "My Profile", path: "/admin/my-Profile", icon: userInfo },
];
export const studentMenuLinks = [
  { name: "My Courses", path: "/student/my-courses", icon: bookOpenIcon },
  { name: "My Formations", path: "/student/my-formations", icon: listIcon },
];
export const clientMenuLinks = [
  { name: "Dashboard", path: "/client/dashboard", icon: homeIcon },
  { name: "My Plans", path: "/client/my-plans", icon: listIcon },
];