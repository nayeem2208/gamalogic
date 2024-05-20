import { FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoInstagram, IoLogoTwitter, IoMail } from "react-icons/io5";
import { AiOutlineHome } from "react-icons/ai";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-bgblue w-full  h-10 flex justify-between items-center px-1 md:px-6 text-white fixed bottom-0 left-0 right-0 z-10">
      <div className="text-xs md:text-sm">© Gamalogic 2019-2024</div>
      <div className="w-3/6 md:w-2/12">
        <ul className="flex justify-between items-center text-sm">
          {/* <li className="flex items-center justify-center"><Link to="/" className="flex font-semibold"><AiOutlineHome className="mr-1"/>Home </Link></li> */}
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
            <a href="https://www.youtube.com/@Gamalogic" target="_blank"  className="flex items-center font-light">
          <FaYoutube /></a>
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
              <FaXTwitter />
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
