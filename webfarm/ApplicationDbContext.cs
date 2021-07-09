using Microsoft.EntityFrameworkCore;
using webfarm.Entities;

namespace webfarm
{
    public class ApplicationDbContext : DbContext
    {

        public ApplicationDbContext(DbContextOptions options) : base(options) { }
        public DbSet<Log> logs { get; set; }
        public DbSet<Reading> readings { get; set; }
        public DbSet<Schedule> schedule { get; set; }
    }
}