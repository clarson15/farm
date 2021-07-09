using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using webfarm.Entities;
using webfarm.Models;

namespace webfarm.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DataController : ControllerBase
    {

        private readonly ILogger<DataController> _logger;
        private readonly ApplicationDbContext _dbContext;

        public DataController(ILogger<DataController> logger, ApplicationDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        [HttpGet("logs")]
        public async Task<IActionResult> Logs([FromQuery] int skip, [FromQuery] int take, [FromQuery] int? level)
        {
            var query = _dbContext.logs.OrderByDescending(x => x.at).AsQueryable();
            if (level.HasValue)
            {
                query = query.Where(x => x.level == level);
            }
            var tableResult = new TableResult<Log>
            {
                Count = await query.CountAsync(),
                Items = await query.Skip(skip).Take(take).ToListAsync()
            };
            return Ok(tableResult);
        }

        [HttpGet("readings")]
        public async Task<IActionResult> Readings([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            return Ok(await _dbContext.readings.Where(x => x.at >= from && x.at <= to).ToListAsync());
        }

        [HttpGet("schedule")]
        public async Task<IActionResult> Schedule()
        {
            return Ok(await _dbContext.schedule.ToListAsync());
        }

        [HttpPost("schedule")]
        public async Task<IActionResult> ScheduleSave([FromBody] IEnumerable<Schedule> schedules)
        {
            _dbContext.schedule.RemoveRange(await _dbContext.schedule.ToArrayAsync());
            await _dbContext.AddRangeAsync(schedules);
            await _dbContext.SaveChangesAsync();
            return Ok();
        }
    }
}
