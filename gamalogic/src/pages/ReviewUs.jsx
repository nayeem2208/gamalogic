import React, { useEffect } from "react";
import SubHeader from "../components/SubHeader";
import { APP } from "../axios/axiosInstance";

function ReviewUs() {
  useEffect(() => {
    if (APP === "beta") {
      document.title = "Review Us | Beta Dashboard";
    } else {
      document.title = "Review Us | Dashboard";
    }
  }, []);

  return (
    <div className="review-us-container px-3 md:px-20 py-8 accountSettings text-center sm:text-start">
      <SubHeader SubHeader={"Review Us"} />
      <div className="mt-10 sm:mt-14 text-bgblue subHeading">
        <h3 className="text-2xl font-bold mb-4">Your Feedback Matters!</h3>
        <p className="my-7 description ">
          We value your feedback and would love to hear about your experience.
          Please take a moment to review us on your favorite platform. Your
          reviews help us grow and improve!
        </p>
        <div className="review-platforms flex flex-wrap gap-3 items-center justify-center md:justify-normal  my-5">
          {/* Review Platforms */}
          {[
            {
              name: "Trustpilot",
              url: "https://www.trustpilot.com/evaluate/gamalogic.com",
              imgSrc: "/Trustpilot-Logo.jpg",
            },
            {
              name: "G2",
              url: "https://www.g2.com/products/gamalogic/take_survey",
              imgSrc: "/g2.png.original.png",
            },
            {
              name: "Capterra",
              url: " https://reviews.capterra.com/products/new/05d039e5-de09-42dc-b71b-c0b9069125e5/?lang=en",
              imgSrc: "/capterra-inc-vector-logo.png",
            },
            {
              name: "GetApp",
              url: "https://www.getapp.com/it-communications-software/a/gamalogic/",
              imgSrc: "/getapp-vector-logo.png",
            },
            {
              name: "Google Workspace",
              url: " https://workspace.google.com/marketplace/app/gamalogic_email_verifier_and_email_finde/231767028935",
              imgSrc: "/google-workspace-logo(1).jpg",
            },
          ].map((platform, index) => (
            <a
              key={index}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="platform-link  flex flex-col  items-center rounded-xl   transition-transform transform  hover:scale-105 hover:shadow-lg"
              //   style={{
              //     background:
              //       "linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(225,227,240,1) 100%)",
              //   }}
            >
              <div className="image-container w-20 h-14 md:w-44 md:h-32  flex items-center  overflow-hidden p-2">
                <img
                  src={platform.imgSrc}
                  alt={platform.name}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* <div className="text-center mx-3 mt-2 w-16 md:w-28">
                <h4 className="text-xs font-semibold text-gray-700">
                  {platform.name}
                </h4>
              </div> */}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReviewUs;
