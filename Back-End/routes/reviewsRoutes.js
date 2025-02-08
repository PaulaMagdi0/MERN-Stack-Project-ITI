const reviews = require ('../models/reviews');
const express = require ('express');
const routes = express.Router;


routes.get('/', async (req , res)=>{
    let reviews=[];

    try{
        if (req.query.book_id!=undefined && req.query.book_id!=null && req.query.book_id!="")
        {
            reviews = await customElements.find({ book_id: req.query.book_id});

        }else{
            reviews= await customElements.find();
        }
        if (!reviews){
            res.status(500).json({success : false})
        }
        return res.status(200).json(reviews);
    }catch(error){

        res.status(500).json({success : false})
    }





});

routes.get('/:id', async (req , res)=>{
    const review = await customElements.findById(req.prams.id);

    if(!review){
        res.status(500).json({message:"the review not found"})
    }
    return res.status(200).send(review);
})

routes.post('/add', async (req,res)=>{
    let review = new comments({
        user_id : req.body.user_id,
        comments: req.body.comments,
        rate: req.body.rate,
        book_id: req.body.book_id
    });

    if(!review){
        res,status(500).json({
            error:err,
            success: false
        })

    }
    review = await review.save();
    res.status(201).json(review);

});