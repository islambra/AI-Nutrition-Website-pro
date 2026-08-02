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
  { name: "createBlog", path: "/dieteticien/create-blog", icon: addIcon },
  { name: "createPlan", path: "/dieteticien/create-plan", icon: addIcon },
  { name: "myPlans", path: "/dieteticien/MyPlans", icon: updateIcon },
  { name: "myBlogs", path: "/dieteticien/MyBlogs", icon: updateIcon },
  { name: "myFormations", path: "/dieteticien/formations", icon: listIcon },
  { name: "consultationRequests", path: "/dieteticien/consultation-requests", icon: Consultation },
  { name: "subscribers", path: "/dieteticien/subscribers", icon: allUsers },
  { name: "resourceLibrary", path: "/dieteticien/resources", icon: listIcon },
  { name: "sales", path: "/dieteticien/payments", icon: payment },
  { name: "paymentApprovals", path: "/dieteticien/payment-approvals", icon: payment },
  { name: "contactMessages", path: "/dieteticien/contact-messages", icon: messagesicon },
  { name: "allClients", path: "/dieteticien/all-clients", icon: allUsers },
  { name: "myProfile", path: "/dieteticien/my-Profile", icon: userInfo },
];
export const adminMenuLinks = [
  { name: "addAdmin", path: "/admin/add-admin-nutritionist", icon: addUsers },
  { name: "allUsers", path: "/admin/all-users", icon: allUsers },
  { name: "payments", path: "/admin/payments", icon: payment },
  { name: "manageDieteticiens", path: "/admin/manage-dieteticiens", icon: messagesicon },
  { name: "createCourse", path: "/admin/create-course", icon: addIcon },
  { name: "allCourses", path: "/admin/all-courses", icon: listIcon },
  { name: "courseSubscriptions", path: "/admin/course-subscriptions", icon: payment },
  { name: "aiToolSubscriptions", path: "/admin/ai-tool-subscriptions", icon: payment },
  { name: "manageContent", path: "/admin/manage-content", icon: listIcon },
  { name: "paymentSettings", path: "/admin/platform-payment-settings", icon: payment },
  { name: "myProfile", path: "/admin/my-Profile", icon: userInfo },
];
export const studentMenuLinks = [
  { name: "myCourses", path: "/student/my-courses", icon: bookOpenIcon },
  { name: "myFormations", path: "/student/my-formations", icon: listIcon },
  { name: "myRequests", path: "/student/my-requests", icon: clockIcon },
];
export const clientMenuLinks = [
  { name: "dashboard", path: "/client/dashboard", icon: homeIcon },
  { name: "mySubscriptions", path: "/client/my-subscriptions", icon: payment },
  { name: "foodDiary", path: "/client/food-diary", icon: listIcon },
  { name: "nutritionProgress", path: "/client/nutrition-progress", icon: listIcon },
  { name: "myPlans", path: "/client/my-plans", icon: listIcon },
  { name: "myRequests", path: "/client/my-requests", icon: clockIcon },
];