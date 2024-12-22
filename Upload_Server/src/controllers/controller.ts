import { Request, Response } from "express";
import { generateID } from "../utils/util";
import simpleGit from "simple-git";
import path from 'path'
const test = (req: Request, res: Response) => {
    res.status(200).json({
        message: "Working Successfully"
    })
}

const deploy = async(req: Request, res: Response) => {
    const { repoUrl } = req.body;
    
    const username = repoUrl.split("/")[3];
    const id = generateID(username);
    console.log(__dirname);
    const basePath = path.join(__dirname, `../output/${id}`)
    

    await simpleGit().clone(repoUrl, basePath)
    
    res.status(200).json({
        id
    })
    
}

export {
    test,
    deploy
}