import { IoWarningOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

function LinkExpired() {
  return (
    <div className="bg-bgblue w-full min-h-screen flex justify-center items-center">
      <div className="px-12 py-4 flex justify-between items-center underlineLi h-20 fixed top-0 left-0 right-0 z-10 bg-bgblue">
        <Link to="/">
          <p className="font-semibold text-2xl text-center text-white">GAMALOGIC</p>
        </Link>
      </div>
      <div className="w-3/5 flex flex-col justify-center items-center">
        <div className="text-center auth" style={{ position: "relative" }}>
          <div className="h2-background" style={{ position: "absolute" }}>
            <div className="red"></div>
            <div className="blue"></div>
          </div>
          <h2 className="font-semibold text-4xl md:text-6xl text-yellow-500">Link Expired</h2>
          <p className="mt-12 description">
            The link you clicked has expired or is no longer valid.
          </p>
          <div className="flex justify-center">
            <IoWarningOutline style={{ fontSize: '15vw' }} className="text-yellow-500" />
          </div>
          <div className="verify-foot-p description">
            <p>
              If you believe this is an error or need assistance, please contact our support team.
            </p>
            <p>
              You can reach us at{" "}
              <a className="text-white" href="mailto:support@gamalogic.com">
                support@gamalogic.com
              </a>
              .
            </p>
            {/* <p className="mt-6">
              To request a new link, please <Link to="/request-new-link" className="text-white underline">click here</Link>.
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkExpired;
