require("dotenv").config();
const asyncHandler = require("express-async-handler");

/**
 * Image generation (w. Karlo)
 * @param { string } prompt
 */
const imgGen = asyncHandler(async (req, res) => {

  await fetch("https://api.kakaobrain.com/v2/inference/karlo/t2i", {
    method: "post",
    headers: {
      Authorization: `KakaoAK ${process.env.REST_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "v2.1",
      prompt: 'male, 81 years old, 172cm, 80kg, a red hat, balck shirt, jeans, asian, whole body, korean',
      width: 1024,
      height: 1024,
    }),
  })
    .then((response) => response.json())
    .then((data) => res.redirect(data.images[0].image));
});

module.exports = { imgGen };
