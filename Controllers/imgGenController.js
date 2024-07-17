require("dotenv").config();
const asyncHandler = require("express-async-handler");

const deepl = require('deepl-node')
const translator = new deepl.Translator(process.env.DEEPL_API_KEY)

const openai = require('openai')
const dalle = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Image generation
 */
const imgGen = asyncHandler(async (req, res) => {
  // Karlo
  // await fetch("https://api.kakaobrain.com/v2/inference/karlo/t2i", {
  //   method: "post",
  //   headers: {
  //     Authorization: `KakaoAK ${process.env.KARLO_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     version: "v2.1",
  //     prompt: `${prompt.age}, ${prompt.gender}, ${prompt.detail}, korean, whole body`,
  //     width: 1024,
  //     height: 1024,
  //   }),
  // })
  //   .then((response) => response.json())
  //   .then((data) => res.redirect(data.images[0].image));

  // DallE
  const response = await dalle.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  });
  image_url = response.data[0].url;

  console.log(image_url)
});

module.exports = { imgGen };
