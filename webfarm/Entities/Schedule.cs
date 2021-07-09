using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using webfarm.Helpers;

namespace webfarm.Entities
{
    [Table("schedule")]
    public class Schedule
    {
        [Key]
        public int id { get; set; }

        [JsonConverterAttribute(typeof(TimeSpanConverter))]
        public TimeSpan at { get; set; }
        public bool enabled { get; set; }
    }
}