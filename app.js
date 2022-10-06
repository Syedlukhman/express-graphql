const express=require("express") 
const app=express()
app.use(express.json())
const db=require("./conn")
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');






var schema=buildSchema(`

    input ProductInput{
        productid:Int,
        productName:String,
        categoryId:Int,
        categoryName:String
    }

    type Product{
    productid:Int,
    productName:String,
    categoryId:Int,
    categoryName:String
       
    }

    type Query{
       hello:String ,
       getAllProducts:Product
    }


    type Mutation{
        createProduct(input: ProductInput):Product,
        updateProduct(previousName:String,input:ProductInput):Product,
        deleteProduct(productName:String):Product
    }

`);

var root={
    createProduct:async({input})=>
    {
        const {productid,productName,categoryId,categoryName}=input
        const body={
            productName:productName,
            productid:productid,
            categoryId:categoryId,
            categoryName:categoryName
        }
        // console.log(body)
            // const catID = req.body.categoryId; //catId to check if data has any category
            // const checkProduct = req.body.productName; //checkProduct to check if a product with same name is already present
            const check = await db.ProductModel.find(
        { productName: productName },
        { _id: 0, productName: 1 }
        );
        const checkId = await db.CategoryModel.find(
            { categoryId: categoryId },
            { _id: 0, categoryId: 1 }
        ); //check catID to check if category number is already present in database
        if (check != "") {
            //checks if product is already present
            console.log("product is already present! product or category with existing product name or category id cannot be created!")
           this.string="product is already present! product or category with existing product name or category id cannot be created!"
        } else if (check == "" && categoryId != undefined) {
            //if product is not present and categoryid is there in new data
            if (checkId == "") {
            //id is empty
            //to check if categoryId from new data is empty and if productName and categoryID is not in db
            const productInsert = new db.ProductModel(body);
            const categoryInsert = new db.CategoryModel(body);
            const saveP = await productInsert.save();
            const saveC = await categoryInsert.save();
                console.log("product " + saveP.productName +" and its category " + saveC.categoryName +" are saved successfully")
            
            } else {
            //categoryid is already present
            console.log(
                "category with same categoryId is already present! product or category with existing product name or categoryid cannot be created!"
            );
            this.string="category with same categoryId is already present! product or category with existing product name or categoryid cannot be created!"
            
                 
            }
        } else {
            //only product is given as input
            const productInsert = new db.ProductModel(body);
            const savedb = await productInsert.save();
             this.string=`product " + ${savedb.productName} + " is saved successfully`;
            
        }
        console.log(this.string)
        return "this.string"
    },
    hello:()=>{
        return "Hello lukhman"
    },

    getAllProducts: async()=>{
        try {
            const productData = await db.ProductModel.find({}, { _id: 0, __v: 0 });
            let dataN = []; //array to store product n category model
            //for each loop on product model
            for (var i = 0; i < productData.length; i++) {
              if (productData[i].categoryId) { //checks if category for given product is present or not
                const CategoryData = await db.CategoryModel.find({ categoryId: productData[i].categoryId }, { _id: 0, __v: 0 });
                dataN.push(
                  Product_Model=productData[i],
                  Category_Model= CategoryData[0],
                
                )
              } else {
                dataN.push(
                  Product_Model = productData[i], //pushes product model
                );
              }
            }
            console.log(dataN)
            return dataN;
            
          } catch (error) {
            console.log(error.message)
            return error.message;
          }
    },

    updateProduct:async(input)=>{
        try {
           const {previousName}=input
            const {productid,productName,categoryId,categoryName,}=input.input
            console.log(input)
        const body={
            productName:productName,
            productid:productid,
            categoryId:categoryId,
            categoryName:categoryName
        }
        console.log(body)
            const foundProduct = await db.ProductModel.find({ productName:previousName }); //to check if product with given name is present or not
          // const checkId = foundProduct[0].categoryId
          // console.log(foundProduct=="")
          if (foundProduct!="") {
            if (categoryId != null) { // if product has category
        
              const productUpdate = await db.ProductModel.find({
                productName: previousName,
              }).update(body);
              console.log(productUpdate)
              const checkId = foundProduct[0].categoryId
              const foundCategory = await db.CategoryModel.find({ categoryId: checkId })
              // if category is present
        
              if (foundCategory[0]) { //update the existing category
        
                const categoryUpdate = await db.CategoryModel.find({ categoryId: checkId }).update(
                  body
                )
                console.log(categoryUpdate)
                console.log("product " + productName + " and its category " + categoryName + " has been updated");
        
              }
              else {
                const categoryInsert = new db.CategoryModel(body);
        
                const saveC = await categoryInsert.save();
                console.log(saveC)
                console.log("product " + productName + " and its category " + categoryName + " is created");
              }
        
            } else {
              const update = await db.ProductModel.find({
                productName: previousName,
              }).update(body);
              console.log(update)
              console.log("product " + previousName + " has been updated");
            }
          } else {
            console.log("product " + previousName + "could not be found");
          }
          } catch (error) {
            console.log(error)
          }
    },

    deleteProduct:async(input)=>{
        
        
        try {
            const {productName}=input
            const productData = await db.ProductModel.findOne(
              { productName:productName },
              { _id: 0 }
            ); //check if porduct with given name is present
            // if(productData.categoryId==null){
            //   console.log("its null")
            // }else{
            //   console.log("its not null")
            // }
            if (productData) {
        
              if (productData.categoryId != null) {
                const id = await db.ProductModel.find(
                  { productName: productName },
                  { _id: 0, categoryId: 1 }
                );
                //check for categoryId
                const result = await db.ProductModel.findOneAndDelete({
                  productName: productName,
                }); //deletes product
                const result1 = await db.CategoryModel.findOneAndDelete({
                  categoryId: id[0].categoryId,
                }); //deletes category of corresponding product
                console.log(
                  "product " + result.productName + " and its categories are deleted"
                );
              } else {
                //if category is not present delete the product table
                const result = await db.ProductModel.findOneAndDelete({
                  productName: productName,
                });
                console.log("deleted product table is : " + result);
              }
            } else {
              //if given name is not present
              console.log(
                "product with name " +productName + " is not present"
              );
            }
          } catch (error) {
            console.log(error);
          }
    }
}

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql');
});