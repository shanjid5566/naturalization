import { useContext } from "react";
import { CiSettings } from "react-icons/ci";
import { MdOutlineLogout } from "react-icons/md";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const AdminProfile = () => {
  const { logout } = useContext(AuthContext);
  const handleLogoutClick = () => {
  
    logout();
    console.log("Logout clicked");
  };

  return (
    <div className="flex flex-col items-center gap-1 my-3">
   
      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0">
        <img
          src="https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Profile"
          className="w-full h-full  rounded-full object-cover "
        />
      </div>

  
      <h1 className="text-white text-lg font-normal text-center my-1">
        Floyd Miles
      </h1>


      <div className="flex gap-3">

        <Link to = '/profile'
        
          className="hover:opacity-70 transition-opacity"
        >
          <CiSettings className="text-white w-6 h-6" />
        </Link >

       
        <button
          onClick={handleLogoutClick}
          className="hover:opacity-70 transition-opacity"
        >
          <MdOutlineLogout className="text-white w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default AdminProfile;
