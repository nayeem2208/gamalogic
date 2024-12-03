import SubHeader from "../components/SubHeader";
import { useEffect, useState } from "react";
import { APP } from "../axios/axiosInstance";

export default function IntegrationPage() {
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [filteredFeatures, setFilteredFeatures] = useState([]); // State for filtered features

  useEffect(() => {
    if (APP == "beta") {
      document.title = "Integrate | Beta Dashboard";
    } else {
      document.title = "Integrate | Dashboard";
    }
  }, []);

  const features = [
    {
      title: "Google Sheets Integration",
      description:
        "Connect with Google Sheets for Email Address Verification and Prospect finder",
      link: "https://workspace.google.com/marketplace/app/gamalogic_email_verifier_and_email_finde/231767028935",
      image: "/sheets.png",
    },
  ];

  // Update filtered features whenever the search query changes
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const results = features.filter((feature) =>
      feature.title.toLowerCase().includes(lowerCaseQuery) ||
      feature.description.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredFeatures(results);
  }, [searchQuery]);

  return (
    <div className="px-4 sm:px-6 lg:px-20 py-8 text-center sm:text-start">
      <SubHeader SubHeader={"Integration"} />
      <div className="mt-14 subHeading">
        <h3 className="text-xl sm:text-2xl font-bold">Integrate with Our Features</h3>
        <p className="my-6 text-sm sm:text-base text-gray-600">
          Explore and integrate with our wide range of features to enhance your experience.
        </p>

        {/* Search Box */}
        <div className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search integrations..."
            className="border rounded-md py-2 px-4 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-bgblue"
          />
        </div>

        {/* Display Features */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {filteredFeatures.map((feature, index) => (
            <div
            key={index}
            className="flex flex-col sm:flex-row border rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300 items-center sm:items-start"
          >
            {/* Image Section */}
            <div className="w-full sm:w-1/4 py-5 h-32 overflow-hidden mb-4 sm:mb-0">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full h-full object-contain rounded-md"
              />
            </div>
          
            {/* Text Section */}
            <div className="sm:w-3/4 sm:pl-6">
              <h4 className="font-semibold text-lg">{feature.title}</h4>
              <p className="mt-3 mb-4 text-sm text-gray-600 ">
                {feature.description}
              </p>
              <a
                href={feature.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-bgblue text-white py-2 px-4  rounded-md text-sm font-medium"
              >
                Integrate
              </a>
            </div>
          </div>
          
          ))}
        </div>
      </div>
    </div>
  );
}
