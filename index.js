const sharp = require('sharp');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client();

exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = decodeURIComponent(event.Records[0].s3.object.key); // original/고양이_시간.png
  const filename = Key.split('/').at(-1);
  const ext = Key.split('.').at(-1).toLocaleLowerCase();
  const requiredFormat = ext === 'jpg' ? 'jpeg' : ext;
  console.log('name', filename);
  console.log('ext', ext);

  try {
    const s3Object = await s3.getObject({Bucket, Key});
    console.log('original', s3Object);
    console.log('오리지널 용량', s3Object.Body.length);
    const resizedImage = await sharp(s3Object.Body)
      .resize(200, 200, { fit: 'inside' })
      .toFormat(requiredFormat)
      .toBuffer();
    await s3.putObject({
      Bucket,
      Key: `thumb/${filename}`,
      Body: resizedImage
    });
    console.log('thumb', resizedImage);
    console.log('thumb 용량', resizedImage.length);
    return callback(null )
  } catch(err) {
    console.error(err);
    return callback(err);
  }
}