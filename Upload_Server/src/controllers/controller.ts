import { Request, Response } from "express";

const test = (req: Request, res: Response) => {
    res.status(200).json({
        message: "Working Successfully"
    })
}

const deploy = (req: Request, res: Response) => {

}

export {
    test,
    deploy
}