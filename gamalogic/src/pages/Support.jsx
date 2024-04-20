import SubHeader from "../components/SubHeader";
import { IoLogoTwitter, IoMail } from "react-icons/io5";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";

export default function Support() {
  return (
    <div className=" px-20 py-8">
      <SubHeader SubHeader={"Support"} />
      <div className="mt-14 subHeading">
        <h3>We're Here To Help</h3>
        <p className="my-7 w-4/5 description">
          We provide 24x7 support for our customers. Connect with us by sending
          a mail here -{" "}
          <a href="mailto:support@gamalogic.com" className="underline font-medium" target="_blank">support@gamalogic.com</a> or
          through any of our social media accounts.
        </p>
        <ul className="mt-36">
          <li className="my-2">
            <a className="flex items-center font-light" href="mailto:support@gamalogic.com" target="_blank"><IoMail className="mr-3"/>
              Email
            </a>
          </li>
          <li className="my-2">
            <a className="flex items-center font-light" href="https://twitter.com/Gamalogicapp" target="_blank"><IoLogoTwitter className="mr-3"/>
              Twitter
            </a>
          </li>
          <li className="my-2">
            <a className="flex items-center font-light" href="https://www.facebook.com/gamalogicapp" target="_blank"><FaFacebookF className="mr-3"/>
              Facebook
            </a>
          </li>
          <li className="my-2">
            <a className="flex items-center font-light"
              href="https://www.linkedin.com/company/gamalogic"
              target="_blank"
            ><FaLinkedinIn className="mr-3" />
              Linkedin
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
