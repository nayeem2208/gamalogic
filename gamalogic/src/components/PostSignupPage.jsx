import { IoMailOutline } from "react-icons/io5";

function PostSignupPage() {
  return (
    <div
    className="w-full flex justify-center items-center "
    style={{ marginTop: "36vw",marginBottom:'30vw' }}
  >
    <div className="w-3/5 flex flex-col justify-center items-center">
      <div className="text-center auth" style={{ position: "relative" }}>
        <div className="h2-background" style={{ position: "absolute" }}>
          <div className="red"></div>
          <div className="blue"></div>
        </div>
        <h2 className="font-semibold text-4xl">Verify Your Email Address</h2>
        <p className="mt-12 description">
        Your details are already there in our system. But to complete your registration, please
            verify your email address.
        </p>
        <div className=" flex justify-center">
        <IoMailOutline style={{fontSize:'30vh'}} className="font-light text-cyan-400"/></div>
        <div className="verify-foot-p description">
            <p>We have sent a verification link to your email address.</p>
            <p>Follow the link in the email to validate and complete your registration.</p>
            <p>To resend your verification link, <a className='text-white' href="/resend1">click here</a></p>
            <p>If you are having any trouble, contact us at, <a className='text-white'
                    href="mailto:support@gamalogic.com">support@gamalogic.com</a></p>
        </div>
      </div>
     
    </div>
  </div>
  )
}

export default PostSignupPage
