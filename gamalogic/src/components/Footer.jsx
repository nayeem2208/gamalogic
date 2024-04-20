import React from "react";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { IoLogoInstagram, IoLogoTwitter, IoMail } from "react-icons/io5";
import { AiOutlineHome } from "react-icons/ai";

function Footer() {
  return (
    <footer className="bg-bgblue w-full  h-10 flex justify-between items-center px-6 text-white fixed bottom-0 left-0 right-0 z-10">
      <div>© Gamalogic 2019-2024</div>
      <div className="w-2/12">
        <ul className="flex justify-between items-center text-sm">
          <li className="flex items-center justify-center"><AiOutlineHome className="mr-1"/>Home</li>
          <li className="my-2">
            <a
              className="flex items-center font-light"
              href="https://www.facebook.com/gamalogicapp"
              target="_blank"
            >
              <FaFacebookF  />
            </a>
          </li>
          <li className="my-2">
            <a href="https://www.instagram.com/gamalogicapp/" target="_blank"  className="flex items-center font-light">
          <IoLogoInstagram /></a>
          </li>
          <li>
            <a
              className="flex items-center font-light"
              href="mailto:support@gamalogic.com"
              target="_blank"
            >
              <IoMail  />
            </a>
          </li>
          <li><a
              className="flex items-center font-light"
              href="https://twitter.com/Gamalogicapp"
              target="_blank"
            >
              <IoLogoTwitter  />
            </a></li>
           
          <li className="my-2">
            <a
              className="flex items-center font-light"
              href="https://www.linkedin.com/company/gamalogic"
              target="_blank"
            >
              <FaLinkedinIn  />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
