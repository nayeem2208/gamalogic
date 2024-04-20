import SubHeader from "../components/SubHeader";

function IntegrateGoogleSheet() {
  return (
    <div className=" px-20 py-8">
      <SubHeader SubHeader={"Tutorial"} />
      <div class="dashboard-content-inner">
        <div className="mt-14 subHeading">
          <h3>Email validation using google sheets add-on</h3>
          <p className="my-7 w-4/5 description">
            Google sheets are the most popular and effective tools for digital
            marketers where they consolidate and compile the data like email
            address list. And it is a free service hosted on the cloud with
            access to multiple devices in real-time. It is an alternative to MS
            Excel with having the capability to edit on the same file by two or
            more users. This is why most of the successful digital marketers are
            adapting on google sheets.
          </p>
           <h5 className="font-semibold text-lg">Step 1</h5>
          <p className="my-7 w-4/5 description"> Open your google sheets.</p>
          <br />
          <img src="/public/step-1.gif" height="100%" width="100%" />
          <br />
           <h5 className="font-semibold text-lg">Step 2</h5>
          <p className="my-7 w-4/5 description">
            Install Gamalogic Email Verifier and Email Finder Google sheet
            add-on from Google Workspace Marketplace.
            <a
              href="https://workspace.google.com/marketplace/app/gamalogic/231767028935"
              target="_blank"
              class="dark"
            >
              <b>Click here for the link</b>
            </a>
            . This won't take more than 1 miniute.
          </p>

          <br />
          <img src="/public/step-2.gif" height="100%" width="100%" />
          <br />
           <h5 className="font-semibold text-lg">Step 3</h5>
          <p className="my-7 w-4/5 description">
            Click on the Add-on tab from Google sheet menubar and then select
            Email verifier or Email finder from the list.
          </p>
          <br />
          <img src="/public/step-3.gif" height="100%" width="100%" />
          <br />

           <h5 className="font-semibold text-lg">Step 4</h5>

          <p className="my-7 w-4/5 description">
            Now the Add-on side bar pops up. Copy and paste the Gamalogic API
            key from
            <a
              href="https://gamalogic.com/dashboard/apikey"
              target="_blank"
              class="dark"
            >
              <b>Gamalogic dashboard</b>
            </a>
            to the Gamalogic add-on text box.
          </p>
          <br />
          <img src="/public/step-4.gif" height="100%" width="100%" />
          <br />

           <h5 className="font-semibold text-lg">Step 5</h5>
          <p className="my-7 w-4/5 description">
            You can add headers by checking the check box from the add-on
            sidebar.
          </p>
          <br />
          <img src="/public/step-5.gif" height="100%" width="100%" />
          <br />
           <h5 className="font-semibold text-lg">Step 6</h5>
          <p className="my-7 w-4/5 description">
            Add the email address list to be verified in the column A or below
            header email address.
          </p>
          <br />
          <img src="/public/step-6.png" height="100%" width="100%" />
          <br />
           <h5 className="font-semibold text-lg">Step 7</h5>
          <p className="my-7 w-4/5 description">
            Validate the email address list by clicking start validate button
            from the add-on.
          </p>
          <br />
          <img src="/public/step-7.gif" height="100%" width="100%" />
          <br />
           <h5 className="font-semibold text-lg">Step 8</h5>
          <p className="my-7 w-4/5 description">
            Wait for the results to generate. Your results will be displayed in
            colour code format. Green which true or valid Address, Red are
            Invalid Address, Yellow are Catch-All Address and Grey will be
            Unknown Address. Your balance credits will be updated and with
            number of list verified in the sidebar.
          </p>
          <br />
          <img src="/public/step-8.gif" height="100%" width="100%" />
          <br />
          <p className="my-7 w-4/5 description">
            You can now sort the results according to the results or color code
            as per your needs. If you are sort of credits click buy credits.
          </p>
          <p className="my-7 w-4/5 description"> Go through our video tutorial. Thank you</p>

          <iframe
            width="100%"
            height="402"
            src="https://www.youtube.com/embed/1LV-2qmiE-E"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default IntegrateGoogleSheet;
