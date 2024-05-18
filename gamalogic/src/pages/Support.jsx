import SubHeader from "../components/SubHeader";
import { IoLogoTwitter, IoMail } from "react-icons/io5";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { useEffect } from "react";

export default function Support() {
  useEffect(()=>{
    document.title='Support | Beta Dashboard'
  },[])
  return (
    <div className="px-6 md:px-20 py-8">
      <SubHeader SubHeader={"Support"} />
      <div className="mt-14 subHeading">
        <h3>We&apos;re Here To Help</h3>
        <p className="my-7 w-4/5 description">
          We provide 24x7 support for our customers. Connect with us by sending
          a mail here -{" "}
          <a href="mailto:support@gamalogic.com" className="underline font-medium" target="_blank">support@gamalogic.com</a> 
        </p>
        <ul className=" text-sm lg:bottom-24  lg:absolute">
          <li className="my-4">
            <a className="flex items-center font-light" href="mailto:support@gamalogic.com" target="_blank"><IoMail className="mr-3 text-base"/>
              Email
            </a>
          </li>
          <li className="my-4">
            <a className="flex items-center font-light" href="https://twitter.com/Gamalogicapp" target="_blank"><IoLogoTwitter className="mr-3 text-base"/>
              Twitter
            </a>
          </li>
          <li className="my-4">
            <a className="flex items-center font-light" href="https://www.facebook.com/gamalogicapp" target="_blank"><FaFacebookF className="mr-3 text-base"/>
              Facebook
            </a>
          </li>
          <li className="my-4">
            <a className="flex items-center font-light"
              href="https://www.linkedin.com/company/gamalogic"
              target="_blank"
            ><FaLinkedinIn className="mr-3 text-base" />
              Linkedin
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
