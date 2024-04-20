import SubHeader from "../components/SubHeader";

function FindAnyEmail() {
  return (
    <div className=" px-20 py-8">
      <SubHeader SubHeader={"Tutorial"} />
      <div class="dashboard-content-inner">
        <div className="mt-14 subHeading">
          <h3>How to Find Anyone's Email Address using Google Sheets</h3>
          <p className="my-7 w-4/5 description">
          Let’s jump into the tutorial. 
          </p>
          <h5 className="font-semibold text-lg">Step 1</h5>
          <p className="my-7 w-4/5 description">Open a new Google sheet.</p>

          <br />
          <img src="/public/step-1.gif" height="100%" width="100%" />
          <br />
          <h5 className="font-semibold text-lg">Step 2</h5>
          <p className="my-7 w-4/5 description">
            Install Gamalogic Email Verifier and Email Finder Google sheet
            add-on from Google Workspace Marketplace.
            <a
              // href="https://workspace.google.com/marketplace/app/gamalogic/231767028935"
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
          <p className="my-7 w-4/5 description">Click on the Finder tab on the Add-on sidebar</p>
          <br />
          <img src="/public/step5emailfinder.gif" height="100%" width="100%" />
          <br />
          <h5 className="font-semibold text-lg">Step 6</h5>
          <p className="my-7 w-4/5 description">
            You can add headers by checking the check box from the add-on
            sidebar.
          </p>
          <br />
          <img src="/public/step6emailfinder.gif" height="100%" width="100%" />
          <br />
          <h5 className="font-semibold text-lg">Step 7</h5>
          <p className="my-7 w-4/5 description">
            Add the First name, Second name and Company url in the appropriate
            columns.
          </p>
          <br />
          <img src="/public/step7emailfinder.png" height="100%" width="100%" />
          <br />
          <h5 className="font-semibold text-lg">Step 8</h5>
          <p className="my-7 w-4/5 description">
            Start Email finder by clicking start finder and wait for the
            results. Within seconds you will receive email address.
          </p>
          <br />
          <img src="/public/step8emailfinder.gif" height="100%" width="100%" />
          <br />
          <p className="my-7 w-4/5 description">
            Below we have our video tutorial and comment on your suggestions.
            Happy Successful Email Hunting
          </p>
          <iframe
            width="100%"
            height="451"
            src="https://www.youtube.com/embed/z8o33Us2p8Y"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default FindAnyEmail;
