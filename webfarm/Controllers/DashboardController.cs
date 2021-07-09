using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace webfarm.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DashboardController : ControllerBase
    {

        private readonly ILogger<DashboardController> _logger;
        private readonly ApplicationDbContext _dbContext;

        public DashboardController(ILogger<DashboardController> logger, ApplicationDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        [HttpGet("status")]
        public IActionResult Status()
        {
            try
            {
                var socket = new TcpClient("127.0.0.1", 48307);
                var data = System.Text.Encoding.ASCII.GetBytes("status");
                socket.GetStream().Write(data, 0, data.Length);
                data = new byte[256];
                var len = socket.GetStream().Read(data, 0, data.Length);
                var response = System.Text.Encoding.ASCII.GetString(data, 0, len).Split(',');
                socket.GetStream().Close();
                socket.Close();
                return Ok(new
                {
                    Lights = Convert.ToBoolean(response[0]),
                    Temp = Convert.ToDecimal(response[1]),
                    Humidity = Convert.ToDecimal(response[2])
                });
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpGet("toggle")]
        public IActionResult ToggleLights([FromQuery] bool state)
        {
            try
            {
                var socket = new TcpClient("127.0.0.1", 48307);
                var data = System.Text.Encoding.ASCII.GetBytes($"toggle {state}");
                socket.GetStream().Write(data, 0, data.Length);
                data = new byte[256];
                var len = socket.GetStream().Read(data, 0, data.Length);
                var response = System.Text.Encoding.ASCII.GetString(data, 0, len);
                socket.GetStream().Close();
                socket.Close();
                if (response == "1")
                {
                    return NoContent();
                }
                return StatusCode(500);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpGet("errors")]
        public async Task<IActionResult> RecentErrors()
        {
            var from = DateTime.Now.AddDays(-5);
            var errors = await _dbContext.logs.OrderByDescending(x => x.at).Where(x => x.level == 2 && x.at > from).Take(5).ToListAsync();
            return Ok(errors);
        }
    }
}
