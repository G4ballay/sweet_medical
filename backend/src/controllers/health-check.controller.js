export class HealthCheckController {
    heartBeat(req,res) {
        res.json({
            status: "ok!",
        });
    } 
}
