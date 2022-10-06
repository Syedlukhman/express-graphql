const mongoose= require('mongoose')

const url = `mongodb+srv://syedlukhman:lukhman64@cluster0.khrukyr.mongodb.net/?retryWrites=true&w=majority`;


mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. ${err}`);
    })

const productSchema = new mongoose.Schema({
    productid:Number,
    productName:String,
    categoryId:Number
}) 

const categorySchema = new mongoose.Schema({
    categoryId:{
        type:Number,
        required : true
    },
    categoryName:
    {
        type:String,
        required:true
    }
})

const ProductModel= mongoose.model("product",productSchema)
const CategoryModel= mongoose.model("category",categorySchema)

module.exports={ProductModel,CategoryModel}

