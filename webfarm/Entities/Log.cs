using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace webfarm.Entities
{
    [Table("logs")]
    public class Log
    {
        [Key]
        public int id { get; set; }
        public string message { get; set; }
        public int level { get; set; }
        public DateTime at { get; set; }
    }
}