import crypto from 'crypto';

function hmacDigestFunction(email_id,customer_id){

    let digestRaw = email_id + customer_id
    let algorithm = "sha256"
    let secret = process.env.THRIVE_BRAND_SECRET
    let HMACDigest = crypto.createHmac(algorithm, secret).update(digestRaw).digest("hex")
    return HMACDigest
}

export default hmacDigestFunction