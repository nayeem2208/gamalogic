import React from 'react';
import { useMsal } from '@azure/msal-react';

const MicroSoftSignInButton = () => {
    const { instance } = useMsal();

    const handleLogin = async () => {
        instance.loginRedirect({
            scopes:['user.read']
        })
    };

    return (
        <button onClick={handleLogin} className=' bg-white text-gray-600 flex text-xs font-semibold p-2 w-48 rounded-sm mt-2 ' style={{ maxWidth: '180px'}}>
            <img src="http://orig05.deviantart.net/e2b8/f/2012/035/f/7/windows_8_square_logo_by_darkmaster79-d4on7uq.png" alt=""  className='w-5 h-5 mr-2'/>
             Sign in with Microsoft</button>
    );
};

export default MicroSoftSignInButton;
