const advancedResult = (model,Populate) => async (req,res,next) => {
    let query;
    //Copy of request query
    const reqQuery = { ...req.query };
    
    //Fields to exclude (While selecting specific fields )
    const removeFields = ['select','sort','limit','page'];    // We don't want select to be matched in the db
    removeFields.forEach(param => delete reqQuery[param]);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
     
    // creating operators like $gt, $lte
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/,match => `$${match}`);   
    
    // parsing query string in JSON
    query = JSON.parse(queryStr);

    //fetching resources
    //query = Bootcamp.find(query).populate('courses);
    query = model.find(query);

    //determining select fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');            
        query = query.select(fields);
    }

    if(Populate){
        query = query.populate(Populate);
    }

    //sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt');
    }

    //Pagination
    const page = parseInt(req.query.page,10) || 1;
    const limit = parseInt(req.query.limit,10) || 10;
    const startIndex = (page - 1)*limit;
    const endIndex = page*limit;
    const total = await model.countDocuments();
    query = query.skip(startIndex).limit(limit);

    const pagination = {};
    if(endIndex < total){
        pagination.next = {
            page: page+1,
            limit: limit
        }
    }

    if(startIndex > 0){
        pagination.prev = {
            page: page-1,
            limit: limit
        }
    }

    //executing the query
    const results = await query;

    res.advancedResult = {
        success: true,
        count: results.length,
        pagination: pagination,
        data: results
    }
    next();
}

module.exports = advancedResult;