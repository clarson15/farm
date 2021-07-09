using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace webfarm.Entities
{
    [Table("readings")]
    public class Reading
    {
        [Key]
        public int id { get; set; }
        public decimal humidity { get; set; }
        public decimal temperature { get; set; }
        public DateTime at { get; set; }
    }
}