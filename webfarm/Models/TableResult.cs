using System.Collections.Generic;

namespace webfarm.Models
{
    public class TableResult<T> where T : class
    {
        public IEnumerable<T> Items { get; set; }
        public int Count { get; set; }
    }
}