import React, { Children, useContext } from 'react'
import { UserContext } from "../../context/UserContext";
import Navbar from './Navbar';
import SideMenu from './SideMenu';

const DashboardLayout = ({Children, activeMenu}) => {
    const {user} = useContext(UserContext);
  return (
    <div className=''>
        <Navbar activeMenu={activeMenu} />

        {user && (
            <div className='flex'>
                <div className='max-[1080px]:hidden'>
                    <sideMenu activeMenu={activeMenu} />
                </div>

                <div className='grow mx-5'>{Children}</div>
            </div>
        )}
    </div>
  )
}

export default DashboardLayout