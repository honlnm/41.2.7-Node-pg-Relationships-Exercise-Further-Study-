# Springboard Instructions

# Node-pg Relationships (Further Study)

## **Further Study**

### **Write some tests!**

Make sure that your routes are tested, use ***jest –coverage*** to see how well you have tested your routes.

### **Slugify Company Names**

It might be difficult for customers to make up a customer code themselves when making new companies (preferably, they should have no spaces or weird punctuation, and should be all lower-case).

Fortunately, there’s an NPM library that can help out, ***slugify***. Read about this, and then change the ***POST /companies*** route so that they don’t provide a code directly, but you make this by using ***slugify()*** on the given name.

### **Allow paying of invoices**

Change the logic of this route:

**PUT /invoices/[id] :** Updates an invoice. If invoice cannot be found, returns a 404.
Needs to be passed in a JSON body of `{amt, paid}`
• If paying unpaid invoice: sets ***paid_date*** to today
• If un-paying: sets ***paid_date*** to null
• Else: keep current ***paid_date***
Returns: `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}`

### **Add a Many-to-Many**

**A larger feature**.

Add a table for “industries”, where there is a ***code*** and an ***industry*** field (for example: “acct” and “Accounting”).

Add a table that allows an industry to be connected to several companies and to have a company belong to several industries.

Add some sample data (by hand in ***psql*** is fine).

Change this route:

- when viewing details for a company, you can see the names of the industries for that company

Add routes for:

- adding an industry
- listing all industries, which should show the company code(s) for that industry
- associating an industry to a company
