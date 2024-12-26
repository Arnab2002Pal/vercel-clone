import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getStatus, postGetRepo } from "@/services/api"
import { useEffect, useState } from "react"
import { ColorRing } from 'react-loader-spinner'

export function CardWithForm() {
    const [gitRepo, setGitRepo] = useState("")
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState("")
    const [id, setID] = useState(null)

    useEffect(() => {
        let intervalID: NodeJS.Timeout | null = null;

        if (id) {
            intervalID = setInterval(async () => {
                try {
                    const res = await getStatus(`/status?id=${id}`);
                    setStatus(res.status);

                    if (res.status === "Deployed") {
                        clearInterval(intervalID!);
                    }
                } catch (error) {
                    console.error("Error fetching status:", error);
                }
            }, 4000);
        }

        return () => {
            if (intervalID) {
                clearInterval(intervalID);
            }
        };
    }, [id]);

    const handleDeploy = async () => {
        try {
            setLoading(true);
            const response = await postGetRepo(`/deploy`, { repoUrl: gitRepo });
            setID(response.id);
            setStatus("Uploading");
        } catch (error) {
            console.error("Error while handling deploy", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Create project</CardTitle>
                <CardDescription>Deploy your new project in one-click.</CardDescription>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="Github Repo to your project"
                                value={gitRepo}
                                onChange={(e) => {
                                    setGitRepo(e.target.value)
                                }}
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
            {
                id ? (
                    <CardFooter className="flex justify-between w-full gap-3">
                        <div
                            className={`text-sm font-medium px-4 py-2 rounded-md ${status === "Deployed"
                                ? "bg-green-100 text-green-700"
                                : "bg-black text-white w-full flex justify-between items-center"
                                }`}
                        >
                            {status === "Deployed" ? (
                                <span>
                                    Deployment Successful!{" "}
                                    <a href={`http://${id}.random.com:3003/index.html`} target="_blank" className="text-blue-600 underline">
                                        View Deployment
                                    </a>
                                </span>
                            ) : (
                                <div className="flex flex-row items-center justify-center w-full">
                                    <span>Progress: {status === 'Uploaded' ? 'Waiting for Deployment' : status}</span>
                                    <div className="flex items-center">
                                        <ColorRing
                                            visible={true}
                                            height="30"
                                            width="30"
                                            ariaLabel="color-ring-loading"
                                            wrapperStyle={{}}
                                            wrapperClass="color-ring-wrapper"
                                            colors={['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']}
                                        />
                                    </div>
                                </div>
                            )
                            }
                        </div>
                    </CardFooter>
                ) : (
                    <CardFooter className="flex flex-col justify-between w-full gap-3">
                        {
                            loading ? (
                                <Button className="w-full" disabled>
                                    Deploying...
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={handleDeploy} className="w-full">Deploy</Button>
                                    <Button variant="outline" className="w-full" onClick={() => setGitRepo("")}>Clear</Button>
                                </>
                            )
                        }
                    </CardFooter>
                )
            }
        </Card >
    )
}
