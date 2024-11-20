import React, { useEffect } from "react";
import SubHeader from "../components/SubHeader";
import { APP } from "../axios/axiosInstance";

function EarnPoints() {
  useEffect(() => {
    if (APP == "beta") {
      document.title = "Loyalty | Beta Dashboard";
    } else {
      document.title = "Loyalty | Dashboard";
    }
  
  }, []);

  return (
    <div className="earn-points-container px-6 md:px-20 py-8 text-center sm:text-start">
      <SubHeader SubHeader={"Earn Points"} />
      <div className="mt-6 sm:mt-14">
        <h3 className="text-bgblue font-semibold text-2xl">Become a Loyalty Member</h3>
        <p className="my-7 description">
          Join our loyalty program and start earning rewards for your engagement! Here's how you can earn points:
        </p>

        {/* Loyalty Benefits */}
        <div className="loyalty-benefits my-10">
          <h4 className="font-semibold text-lg text-bgblue">How to Earn Points</h4>
          <ul className="list-disc list-inside text-gray-700 mt-4">
            <li>Become a loyalty program member to unlock exclusive benefits.</li>
            <li>Add reviews to popular platforms to help us grow.</li>
            <li>Follow us on social media platforms and engage with our posts.</li>
          </ul>
        </div>

        {/* Social Media Section */}
        <div className="social-media my-10">
          <h4 className="font-semibold text-lg text-bgblue">Engage on Social Media</h4>
          <p className="my-4 text-gray-700">
            Connect with us on social media to stay updated and earn rewards for your interaction.
          </p>
          {/* <div className="flex flex-wrap justify-center gap-4">
            {socialMediaLinks.map(({ platform, url }) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-bgblue text-white py-2 px-4 rounded-md text-sm font-medium"
              >
                Follow us on {platform}
              </a>
            ))}
          </div> */}
        </div>

        {/* Review Platforms Section */}
        <div className="review-platforms my-10">
          <h4 className="font-semibold text-lg text-bgblue">Share Your Experience</h4>
          <p className="my-4 text-gray-700">
            Leave a review about your experience with Gamalogic on trusted platforms and earn points.
          </p>
          {/* <div className="flex flex-wrap justify-center gap-4">
            {reviewPlatforms.map(({ platform, url }) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-bgblue text-white py-2 px-4 rounded-md text-sm font-medium"
              >
                Review us on {platform}
              </a>
            ))}
          </div> */}
        </div>

        {/* <div className="cta-section mt-10 text-center">
          <p className="description">
            Start your journey today and become a part of our growing community!
          </p>
          <a
            href="#"
            className="bg-green-500 text-white py-2 px-6 rounded-md mt-6 inline-block font-medium"
          >
            Join the Loyalty Program
          </a>
        </div> */}
      </div>
    </div>
  );
}

export default EarnPoints;
